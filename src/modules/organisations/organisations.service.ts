import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
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
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationMember } from './entities/org-members.entity';
import { Organisation } from './entities/organisations.entity';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { SearchMemberQueryDto } from './dto/search-member-query.dto';
import { RemoveOrganisationMemberDto } from './dto/org-member.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { RoleCategory } from '../organisation-role/helpers/RoleCategory';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';

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
    private readonly permissionsRepository: Repository<Permissions>
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

  async updateOrganisation(
    id: string,
    updateOrganisationDto: UpdateOrganisationDto
  ): Promise<{ message: string; org: Organisation }> {
    try {
      const org = await this.organisationRepository.findOneBy({ id });
      if (!org) {
        throw new NotFoundException('organisation not found');
      }
      await this.organisationRepository.update(id, updateOrganisationDto);
      const updatedOrg = await this.organisationRepository.findOneBy({ id });

      return { message: 'Organisation successfully updated', org: updatedOrg };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
    }
  }

  async searchOrganisationMember(orgId: string, searchTerm: string, searchMemberQueryDto: SearchMemberQueryDto) {
    const organisationMembers = await this.organisationMemberRepository.find({
      where: { organisation_id: { id: orgId } },
      relations: ['user_id', 'profile_id'],
      withDeleted: true,
    });

    const searchedMembersResult = organisationMembers.filter(member => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const fieldsToSearch = [
        member.user_id.first_name,
        member.user_id.last_name,
        member.user_id.email,
        member?.profile_id?.username,
        `${member.user_id.first_name} ${member.user_id.last_name}`,
        `${member.user_id.first_name}${member.user_id.last_name}`,
      ];

      const memberFound = fieldsToSearch.some(field => field?.toLowerCase()?.includes(lowerCaseSearchTerm));

      if (!memberFound) return false;
      if (searchMemberQueryDto.filter && member[searchMemberQueryDto.filter]) return true;
      if (searchMemberQueryDto.filter) return false;
      return true;
    });

    const searchedResultResponseFormat = searchedMembersResult.map(member => ({
      user_id: member.user_id.id,
      username: member?.profile_id?.username,
      email: member.user_id.email,
      name: `${member.user_id.first_name} ${member.user_id.last_name}`,
      phone_number: member.user_id?.phone,
      profile_pic_url: member?.profile_id?.profile_pic_url,
    }));

    return { message: 'User(s) found successfully', data: { members: searchedResultResponseFormat } };
  }

  async removeOrganisationMember(removeOrganisationMemberDto: RemoveOrganisationMemberDto) {
    const { organisationId, userId } = removeOrganisationMemberDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException('No user found with the provided id', 404);
    }

    const org = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!org) {
      throw new CustomHttpException('No organisation found with the provided id', 404);
    }

    const orgMember = await this.organisationMemberRepository.findOne({
      where: {
        organisation_id: { id: organisationId },
        user_id: { id: userId },
      },
    });
    if (!orgMember) {
      throw new CustomHttpException('No organisation member found with provided ids', 404);
    }

    await this.organisationMemberRepository.softDelete(orgMember.id);

    return { message: 'Member removed from organisation successfully' };
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
}
