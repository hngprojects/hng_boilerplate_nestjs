import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { OrganisationMembersResponseDto } from './dto/org-members-response.dto';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { OrganisationMember } from './entities/org-members.entity';
import { Organisation } from './entities/organisations.entity';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { UpdateMemberRoleDto } from './dto/update-organisation-role.dto';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { ORG_MEMBER_DOES_NOT_BELONG, ORG_MEMBER_NOT_FOUND, ROLE_NOT_FOUND } from '../../helpers/SystemMessages';
import { MemberRoleMapper } from './mapper/member-role.mapper';
import { AddMemberDto } from './dto/add-member.dto';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { RoleCategory } from '../organisation-role/helpers/RoleCategory';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import UserService from '../user/user.service';
import { isUUID } from 'class-validator';
import { createObjectCsvStringifier } from 'csv-writer';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganisationMember)
    private readonly organisationMemberRepository: Repository<OrganisationMember>,
    @InjectRepository(OrganisationRole)
    private readonly roleRepository: Repository<OrganisationRole>,
    @InjectRepository(DefaultRole)
    private readonly defaultRoleRepository: Repository<DefaultRole>,
    @InjectRepository(DefaultPermissions)
    private readonly defaultPermissionsRepository: Repository<DefaultPermissions>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    private readonly userService: UserService
  ) {}

  async getOrganisationMembers(
    orgId: string,
    page: number,
    page_size: number,
    sub: string
  ): Promise<OrganisationMembersResponseDto> {
    const skip = (page - 1) * page_size;
    const orgs = await this.organisationRepository.findOne({
      where: { id: orgId },
      relations: ['organisationMembers', 'organisationMembers.user_id'],
    });

    if (!orgs) throw new NotFoundException('No organisation found');

    let data = orgs.organisationMembers.map(member => {
      return OrganisationMemberMapper.mapToResponseFormat(member.user_id);
    });

    const isMember = data.find(member => member.id === sub);
    if (!isMember) throw new ForbiddenException('User does not have access to the organisation');

    data = data.splice(skip, skip + page_size);

    return { status_code: HttpStatus.OK, message: 'members retrieved successfully', data };
  }

  async create(createOrganisationDto: OrganisationRequestDto, userId: string) {
    const [emailFound, owner, defaultRoles, defaultPermissions] = await Promise.all([
      this.emailExists(createOrganisationDto.email),
      this.userRepository.findOne({ where: { id: userId } }),
      this.defaultRoleRepository.find(),
      this.defaultPermissionsRepository.find(),
    ]);

    if (emailFound) throw new ConflictException('Organisation with this email already exists');

    const mapNewOrganisation = CreateOrganisationMapper.mapToEntity(createOrganisationDto, owner);
    const newOrganisation = this.organisationRepository.create({
      ...mapNewOrganisation,
    });

    for (const role of defaultRoles) {
      const rolePermissions = defaultPermissions.map(defaultPerm => {
        const permission = new Permissions();
        permission.category = defaultPerm.category;
        permission.permission_list = defaultPerm.permission_list;
        return permission;
      });

      const savedPermissions = await this.permissionsRepository.save(rolePermissions);

      const newRole = this.roleRepository.create({
        name: role.name,
        description: role.description,
        permissions: savedPermissions,
        organisation: newOrganisation,
      });

      const savedRole = await this.roleRepository.save(newRole);

      if (!newOrganisation.role) {
        newOrganisation.role = [];
      }
      newOrganisation.role.push(savedRole);
    }

    await this.organisationRepository.save(newOrganisation);
    const defaultAdminRole = newOrganisation.role.find(role => role.name === RoleCategory.Administrator);
    const newMember = new OrganisationMember();
    newMember.user_id = owner;
    newMember.organisation_id = newOrganisation;
    newMember.role = defaultAdminRole;

    await this.organisationMemberRepository.save(newMember);

    const mappedResponse = OrganisationMapper.mapToResponseFormat(newOrganisation);

    return { status: 'success', message: 'organisation created successfully', data: mappedResponse };
  }

  async deleteorganisation(id: string) {
    try {
      const org = await this.organisationRepository.findOneBy({ id });
      if (!org) {
        throw new NotFoundException(`Organisation with id: ${id} not found`);
      }
      org.isDeleted = true;
      await this.organisationRepository.save(org);
      return HttpStatus.NO_CONTENT;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const emailFound = await this.organisationRepository.findBy({ email });
    return emailFound?.length ? true : false;
  }

  async updateOrganisation(orgId: string, updateOrganisationDto: UpdateOrganisationDto) {
    const organisation = await this.organisationRepository.findOne({ where: { id: orgId } });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.organisationRepository.update(orgId, updateOrganisationDto);
    const updatedOrg = await this.organisationRepository.findOne({ where: { id: orgId } });

    return {
      message: SYS_MSG.ORG_UPDATE,
      data: updatedOrg,
    };
  }

  async updateMemberRole(orgId: string, memberId: string, updateMemberRoleDto: UpdateMemberRoleDto) {
    const member = await this.organisationMemberRepository.findOne({
      where: { id: memberId },
      relations: ['user_id', 'organisation_id', 'role'],
    });

    if (!member) {
      throw new CustomHttpException(ORG_MEMBER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (member.organisation_id.id !== orgId) {
      throw new CustomHttpException(ORG_MEMBER_DOES_NOT_BELONG, HttpStatus.FORBIDDEN);
    }

    const newRole = await this.roleRepository.findOne({
      where: {
        name: updateMemberRoleDto.role,
        organisation: { id: orgId },
      },
    });

    if (!newRole) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    member.role = newRole;
    await this.organisationMemberRepository.save(member);

    return {
      message: `${member.user_id.first_name} ${member.user_id.last_name} has successfully been added to the ${newRole.name} role`,
      data: {
        user: member.user_id,
        org: member.organisation_id,
        role: newRole,
      },
    };
  }

  async addOrganisationMember(org_id: string, addMemberDto: AddMemberDto) {
    const organisation = await this.organisationRepository.findOneBy({ id: org_id });
    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { id: addMemberDto.user_id },
      relations: ['profile'],
    });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingMember = await this.organisationMemberRepository.findOne({
      where: { user_id: { id: user.id }, organisation_id: { id: organisation.id } },
    });

    if (existingMember) {
      throw new CustomHttpException(SYS_MSG.MEMBER_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const getDefaultRole = await this.roleRepository.findOne({
      where: { name: RoleCategory.User, organisation: { id: organisation.id } },
    });

    const newMember = this.organisationMemberRepository.create({
      user_id: user,
      role: getDefaultRole,
      profile_id: user.profile,
      organisation_id: organisation,
    });

    await this.organisationMemberRepository.save(newMember);
    return { status: 'success', message: SYS_MSG.MEMBER_ALREADY_SUCCESSFULLY, member: newMember };
  }

  async getUserOrganisations(userId: string) {
    const res = await this.userService.getUserDataWithoutPasswordById(userId);
    const user = res.user as User;

    const createdOrgs =
      user.created_organisations && user.created_organisations.map(org => OrganisationMapper.mapToResponseFormat(org));

    const ownedOrgs =
      user.owned_organisations && user.owned_organisations.map(org => OrganisationMapper.mapToResponseFormat(org));

    const memberOrgs = await this.organisationMemberRepository.find({
      where: { user_id: { id: user.id } },
      relations: ['organisation_id', 'user_id', 'role'],
    });

    const memberOrgsMapped =
      memberOrgs &&
      memberOrgs.map(org => {
        const organisation = org.organisation_id && OrganisationMapper.mapToResponseFormat(org.organisation_id);
        const role = org.role && MemberRoleMapper.mapToResponseFormat(org.role);
        return {
          organisation,
          role,
        };
      });

    if (
      (!createdOrgs && !ownedOrgs && !memberOrgsMapped) ||
      (!createdOrgs.length && !ownedOrgs.length && !memberOrgsMapped.length)
    ) {
      throw new CustomHttpException(SYS_MSG.NO_USER_ORGS, HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'Organisations retrieved successfully',
      data: {
        created_organisations: createdOrgs,
        owned_organisations: ownedOrgs,
        member_organisations: memberOrgsMapped,
      },
    };
  }

  async getOrganizationDetailsById(orgId: string) {
    if (!isUUID(orgId)) {
      throw new CustomHttpException('Must Provide a valid organization Id', HttpStatus.BAD_REQUEST);
    }

    const orgDetails = await this.organisationRepository.findOne({ where: { id: orgId } });

    if (!orgDetails) {
      throw new CustomHttpException('Organization Id Not Found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Fetched Organization Details Successfully', data: orgDetails };
  }

  async exportOrganisationMembers(orgId: string, userId: string): Promise<string> {
    const membersResponse = await this.getOrganisationMembers(orgId, 1, Number.MAX_SAFE_INTEGER, userId);

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
      ],
    });

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(membersResponse.data);

    const filePath = join(__dirname, `organisation-members-${orgId}.csv`);
    fs.writeFileSync(filePath, csvData);

    return filePath;
  }
}
