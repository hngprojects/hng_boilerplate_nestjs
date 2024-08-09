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
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { Organisation } from './entities/organisations.entity';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { Role } from '../role/entities/role.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import CreateOrganisationType from './dto/create-organisation-options';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { ORG_NOT_FOUND, ORG_UPDATE } from '../../helpers/SystemMessages';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { AddMemberDto } from './dto/add-member.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OrganisationUserRole)
    private organisationUserRole: Repository<OrganisationUserRole>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {}

  async getOrganisationMembers(orgId: string, page: number, page_size: number, sub: string) {
    const skip = (page - 1) * page_size;
    const organisation = await this.organisationRepository.findOne({
      where: { id: orgId },
    });

    if (!organisation) throw new NotFoundException('No organisation found');

    const members = await this.organisationUserRole.find({
      where: { organisationId: organisation.id },
      relations: ['user'],
    });

    if (!members.length) {
      return { status_code: HttpStatus.OK, message: 'members retrieved successfully', data: [] };
    }
    const organisationMembers = members.map(instance => instance.user);

    const isMember = organisationMembers.find(member => member.id === sub);
    if (!isMember) throw new ForbiddenException('User does not have access to the organisation');

    const organisationPayload = organisationMembers.map(member => OrganisationMemberMapper.mapToResponseFormat(member));

    const data = organisationPayload.splice(skip, skip + page_size);

    return { status_code: HttpStatus.OK, message: 'members retrieved successfully', data };
  }

  async createOrganisation(createOrganisationDto: CreateOrganisationType, userId: string) {
    const query = await this.create(createOrganisationDto, userId);
    return { status_code: HttpStatus.CREATED, messge: 'Organisation created', data: query };
  }

  async create(createOrganisationDto: CreateOrganisationType, userId: string) {
    if (createOrganisationDto.email) {
      const emailFound = await this.emailExists(createOrganisationDto.email);
      if (emailFound) throw new ConflictException('Organisation with this email already exists');
    }

    const owner = await this.userRepository.findOne({
      where: { id: userId },
    });

    const vendorRole = await this.roleRepository.findOne({ where: { name: 'admin' } });

    const organisationInstance = new Organisation();
    Object.assign(organisationInstance, createOrganisationDto);
    organisationInstance.owner = owner;
    organisationInstance.members = [owner];
    const newOrganisation = await this.organisationRepository.save(organisationInstance);

    const adminRole = new OrganisationUserRole();
    adminRole.userId = owner.id;
    adminRole.organisationId = newOrganisation.id;
    adminRole.roleId = vendorRole.id;

    await this.organisationUserRole.save(adminRole);

    const mappedResponse = OrganisationMapper.mapToResponseFormat(newOrganisation);

    return mappedResponse;
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

  // //  TO BE UPDATED
  async updateOrganisation(orgId: string, updateOrganisationDto: UpdateOrganisationDto) {
    const organisation = await this.organisationRepository.findOne({ where: { id: orgId } });

    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.organisationRepository.update(orgId, updateOrganisationDto);
    const updatedOrg = await this.organisationRepository.findOne({ where: { id: orgId } });

    return {
      message: ORG_UPDATE,
      data: updatedOrg,
    };
  }

  async getUserOrganisations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException('Invalid Request', HttpStatus.BAD_REQUEST);
    }
    const userOrganisations = (
      await this.organisationUserRole.find({
        where: { userId },
        relations: ['organisation', 'role'],
      })
    ).map(instance => ({
      organisation_id: instance.organisation.id,
      name: instance.organisation.name,
      user_role: instance.role.name,
    }));

    return {
      status_code: HttpStatus.OK,
      message: 'Organisations retrieved successfully',
      data: userOrganisations,
    };
  }

  // async updateMemberRole(orgId: string, memberId: string, updateMemberRoleDto: UpdateMemberRoleDto) {
  //   const member = await this.organisationMemberRepository.findOne({
  //     where: { id: memberId },
  //     relations: ['user_id', 'organisation_id', 'role'],
  //   });

  //   if (!member) {
  //     throw new CustomHttpException(ORG_MEMBER_NOT_FOUND, HttpStatus.NOT_FOUND);
  //   }

  //   if (member.organisation_id.id !== orgId) {
  //     throw new CustomHttpException(ORG_MEMBER_DOES_NOT_BELONG, HttpStatus.FORBIDDEN);
  //   }

  //   const newRole = await this.roleRepository.findOne({
  //     where: {
  //       name: updateMemberRoleDto.role,
  //       organisation: { id: orgId },
  //     },
  //   });

  //   if (!newRole) {
  //     throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
  //   }

  //   member.role = newRole;
  //   await this.organisationMemberRepository.save(member);

  //   return {
  //     message: `${member.user_id.first_name} ${member.user_id.last_name} has successfully been added to the ${newRole.name} role`,
  //     data: {
  //       user: member.user_id,
  //       org: member.organisation_id,
  //       role: newRole,
  //     },
  //   };
  // }

  async addOrganisationMember(org_id: string, addMemberDto: AddMemberDto) {
    const organisation = await this.organisationRepository.findOneBy({ id: org_id });
    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { id: addMemberDto.user_id },
      relations: ['organisations'],
    });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingMember = user.organisations.some(org => org.id === organisation.id);

    if (existingMember) {
      throw new CustomHttpException(SYS_MSG.MEMBER_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });

    const defaultRole = new OrganisationUserRole();
    defaultRole.userId = user.id;
    defaultRole.user = user;
    defaultRole.organisation = organisation;
    defaultRole.organisationId = organisation.id;
    defaultRole.roleId = userRole.id;

    await this.organisationUserRole.save(defaultRole);

    user.organisations = [...user.organisations, organisation];
    await this.userRepository.save(user);

    return { status: 'success', message: SYS_MSG.MEMBER_ALREADY_SUCCESSFULLY, member: user };
  }

  // async getUserOrganisations(userId: string) {
  //   const res = await this.userService.getUserDataWithoutPasswordById(userId);
  //   const user = res.user as User;

  //   const createdOrgs =
  //     user.created_organisations && user.created_organisations.map(org => OrganisationMapper.mapToResponseFormat(org));

  //   const ownedOrgs =
  //     user.owned_organisations && user.owned_organisations.map(org => OrganisationMapper.mapToResponseFormat(org));

  //   const memberOrgs = await this.organisationMemberRepository.find({
  //     where: { user_id: { id: user.id } },
  //     relations: ['organisation_id', 'user_id', 'role'],
  //   });

  //   const memberOrgsMapped =
  //     memberOrgs &&
  //     memberOrgs.map(org => {
  //       const organisation = org.organisation_id && OrganisationMapper.mapToResponseFormat(org.organisation_id);
  //       const role = org.role && MemberRoleMapper.mapToResponseFormat(org.role);
  //       return {
  //         organisation,
  //         role,
  //       };
  //     });

  //   if (
  //     (!createdOrgs && !ownedOrgs && !memberOrgsMapped) ||
  //     (!createdOrgs.length && !ownedOrgs.length && !memberOrgsMapped.length)
  //   ) {
  //     throw new CustomHttpException(SYS_MSG.NO_USER_ORGS, HttpStatus.BAD_REQUEST);
  //   }

  //   return {
  //     message: 'Organisations retrieved successfully',
  //     data: {
  //       created_organisations: createdOrgs,
  //       owned_organisations: ownedOrgs,
  //       member_organisations: memberOrgsMapped,
  //     },
  //   };
  // }

  // async getOrganizationDetailsById(orgId: string) {
  //   if (!isUUID(orgId)) {
  //     throw new CustomHttpException('Must Provide a valid organization Id', HttpStatus.BAD_REQUEST);
  //   }

  //   const orgDetails = await this.organisationRepository.findOne({ where: { id: orgId } });

  //   if (!orgDetails) {
  //     throw new CustomHttpException('Organization Id Not Found', HttpStatus.NOT_FOUND);
  //   }
  //   return { message: 'Fetched Organization Details Successfully', data: orgDetails };
  // }

  // async exportOrganisationMembers(orgId: string, userId: string): Promise<string> {
  //   const membersResponse = await this.getOrganisationMembers(orgId, 1, Number.MAX_SAFE_INTEGER, userId);

  //   const csvStringifier = createObjectCsvStringifier({
  //     header: [
  //       { id: 'id', title: 'ID' },
  //       { id: 'name', title: 'Name' },
  //       { id: 'email', title: 'Email' },
  //       { id: 'role', title: 'Role' },
  //     ],
  //   });

  //   const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(membersResponse.data);

  //   const filePath = join(__dirname, `organisation-members-${orgId}.csv`);
  //   fs.writeFileSync(filePath, csvData);

  //   return filePath;
  // }
}
