import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisations.entity';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';

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
  
  async removeUser(orgId: string, userId: string, currentUserId: string) {
    try{
    const org = await this.organisationRepository.findOne({
      where: {
        id: orgId,
      },
      relations: {
        owner: true,
        members: true,
      },
    });

    if (!org) {
      throw new NotFoundException({
        status: 'error',
        message: 'Organisation not found',
        status_code: 404,
      });
    }

    const isOwner = org.owner.id == currentUserId;

    if (!isOwner) {
      throw new UnauthorizedException({
        status: 'Forbidden',
        message: 'Only admin can remove users',
        status_code: 403,
      });
    }

    const findUser = org.members.filter(member => member.id == userId);

    if (findUser.length <= 0) {
      throw new NotFoundException({
        status: 'error',
        message: 'User not found',
        status_code: 404,
      });
    }

    org.members = org.members.filter(member => member.id != userId);

    await this.organisationRepository.save(org);

    return {
      status: 'Success',
      message: 'User removed successfully',
      status_code: 200,
    };
    }catch(err){
      console.error(err);
      if (err instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
    }
}}
