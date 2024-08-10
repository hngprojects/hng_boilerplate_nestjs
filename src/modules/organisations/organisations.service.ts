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
import { ORG_MEMBER_DOES_NOT_BELONG, ORG_NOT_FOUND, ORG_UPDATE, ROLE_NOT_FOUND } from '../../helpers/SystemMessages';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { UpdateMemberRoleDto } from './dto/update-organisation-role.dto';

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
    try {
      if (createOrganisationDto.email) {
        const emailFound = await this.emailExists(createOrganisationDto.email);
        if (emailFound) throw new ConflictException('Organisation with this email already exists');
      }

      const owner = await this.userRepository.findOne({
        where: { id: userId },
      });

      const superAdminRole = await this.roleRepository.findOne({ where: { name: 'super-admin' } });

      const organisationInstance = new Organisation();
      Object.assign(organisationInstance, createOrganisationDto);
      organisationInstance.owner = owner;
      const newOrganisation = await this.organisationRepository.save(organisationInstance);

      const adminRole = new OrganisationUserRole();
      adminRole.userId = owner.id;
      adminRole.organisationId = newOrganisation.id;
      adminRole.roleId = superAdminRole.id;

      await this.organisationUserRole.save(adminRole);

      const mappedResponse = OrganisationMapper.mapToResponseFormat(newOrganisation);

      return mappedResponse;
    } catch (error) {
      console.log(error);
    }
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

  async updateMemberRole(org_id: string, member_id: string, updateMemberRoleDto: UpdateMemberRoleDto) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: org_id },
    });

    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const orgUserRole = await this.organisationUserRole.findOne({
      where: {
        userId: member_id,
        organisationId: org_id,
      },
      relations: ['user', 'role', 'organisation'],
    });

    if (!orgUserRole) {
      throw new CustomHttpException(ORG_MEMBER_DOES_NOT_BELONG, HttpStatus.FORBIDDEN);
    }

    const newRole = await this.roleRepository.findOne({
      where: { name: updateMemberRoleDto.role },
    });

    if (!newRole) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
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
