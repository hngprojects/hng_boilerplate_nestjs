import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) {}

  create(createOrganisationDto: CreateOrganisationDto) {
    return 'This action adds a new organisation';
  }

  async findAll() {
    try {
      const orgs = await this.organisationRepository.find();
      console.log(orgs);

      return orgs;
    } catch (error) {
      console.log(error.message);
    }
    throw new Error(`Internal error`);
  }

  findOne(id: number) {
    return `This action returns a #${id} organisation`;
  }

  async update(
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

      if (!updatedOrg) {
        throw new BadRequestException('Error updating organization');
      }

      return { message: 'Product successfully updated', org: updatedOrg };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} organisation`;
  }
}
