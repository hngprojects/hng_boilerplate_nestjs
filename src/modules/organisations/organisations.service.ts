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
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { Organisation } from './entities/organisations.entity';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { Role } from '../role/entities/role.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import CreateOrganisationType from './dto/create-organisation-options';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { UpdateMemberRoleDto } from './dto/update-organisation-role.dto';
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
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.organisationRepository.update(orgId, updateOrganisationDto);
    const updatedOrg = await this.organisationRepository.findOne({ where: { id: orgId } });

    return {
      message: SYS_MSG.ORG_UPDATE,
      data: updatedOrg,
    };
  }

  async getUserOrganisations(userId: string) {
    const organisations = await this.getAllUserOrganisations(userId);
    return {
      status_code: HttpStatus.OK,
      message: 'Organisations retrieved successfully',
      data: organisations,
    };
  }

  async getAllUserOrganisations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new CustomHttpException('Invalid Request', HttpStatus.BAD_REQUEST);
    }
    const userOrganisations = (
      await this.organisationUserRole.find({
        where: { userId },
        relations: ['organisation', 'organisation.owner', 'role'],
      })
    ).map(instance => ({
      organisation_id: instance?.organisation?.id || '',
      name: instance?.organisation?.name,
      user_role: instance.role.name,
      is_owner: instance.organisation ? instance.organisation.owner.id === user.id : '',
    }));

    return userOrganisations;
  }

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

    const responsePayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };

    return { status: 'success', message: SYS_MSG.MEMBER_ALREADY_SUCCESSFULLY, member: responsePayload };
  }

  async updateMemberRole(org_id: string, member_id: string, updateMemberRoleDto: UpdateMemberRoleDto) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: org_id },
    });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const orgUserRole = await this.organisationUserRole.findOne({
      where: {
        userId: member_id,
        organisationId: org_id,
      },
      relations: ['user', 'role', 'organisation'],
    });

    if (!orgUserRole) {
      throw new CustomHttpException(SYS_MSG.ORG_MEMBER_DOES_NOT_BELONG, HttpStatus.FORBIDDEN);
    }

    const newRole = await this.roleRepository.findOne({
      where: { name: updateMemberRoleDto.role },
    });

    if (!newRole) {
      throw new CustomHttpException(SYS_MSG.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    orgUserRole.role = newRole;
    await this.organisationUserRole.save(orgUserRole);

    return {
      message: `${orgUserRole.user.first_name} ${orgUserRole.user.last_name} has successfully been assigned the ${newRole.name} role`,
      data: {
        user: orgUserRole.user,
        organisation: orgUserRole.organisation,
        role: newRole,
      },
    };
  }
}
