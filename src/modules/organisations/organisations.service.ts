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

    const data = organisationMembers.splice(skip, skip + page_size);

    return { status_code: HttpStatus.OK, message: 'members retrieved successfully', data };
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

      const superAdminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });

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

      return { status_code: HttpStatus.OK, message: 'organisation created successfully', data: mappedResponse };
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
}
