import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisations.entity';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationDto } from './dto/get-organisation';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createOrganisationDto: OrganisationRequestDto, userId: string) {
    const emailFound = await this.emailExists(createOrganisationDto.email);
    if (emailFound)
      throw new UnprocessableEntityException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    const owner = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!owner) {
      throw new Error('Owner not found');
    }
    const mapNewOrganisation = CreateOrganisationMapper.mapToEntity(createOrganisationDto, owner);
    const newOrganisation = this.organisationRepository.create({
      ...mapNewOrganisation,
    });
    await this.organisationRepository.save(newOrganisation);
    const mappedResponse = OrganisationMapper.mapToResponseFormat(newOrganisation);
    return { status: 'success', message: 'organisation created successfully', data: mappedResponse };
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
        throw new NotFoundException('Organization not found');
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

  async getOrganisationById(id: string, userId: string): Promise<OrganisationDto> {
    try {
      const organisation = await this.organisationRepository.findOne({
        where: { id },
        relations: ['owner'],
      });

      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }

      if (organisation.owner.id !== userId) {
        throw new ForbiddenException('You do not have access to this organisation');
      }

      const organisationDto: OrganisationDto = {
        id: organisation.id,
        created_at: organisation.created_at,
        updated_at: organisation.updated_at,
        name: organisation.name,
        description: organisation.description,
        email: organisation.email,
        industry: organisation.industry,
        type: organisation.type,
        country: organisation.country,
        address: organisation.address,
        state: organisation.state,
        isDeleted: organisation.isDeleted,
        owner: {
          id: organisation.owner.id,
          first_name: organisation.owner.first_name,
          last_name: organisation.owner.last_name,
          email: organisation.owner.email,
        },
      };

      return organisationDto;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
      }
      throw new InternalServerErrorException('An unknown error occurred');
    }
  }
}
