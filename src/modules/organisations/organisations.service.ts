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
import { OrganisationMember } from './entities/org-members.entity';
import { Organisation } from './entities/organisations.entity';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { OrganisationMapper } from './mapper/organisation.mapper';
import { RemoveOrganisationMemberDto } from './dto/org-member.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganisationMember)
    private readonly organisationMemberRepository: Repository<OrganisationMember>
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
    const emailFound = await this.emailExists(createOrganisationDto.email);
    if (emailFound) throw new ConflictException('Organisation with this email already exists');

    const owner = await this.userRepository.findOne({
      where: { id: userId },
    });

    const mapNewOrganisation = CreateOrganisationMapper.mapToEntity(createOrganisationDto, owner);
    const newOrganisation = this.organisationRepository.create({
      ...mapNewOrganisation,
    });

    await this.organisationRepository.save(newOrganisation);

    const newMember = new OrganisationMember();
    newMember.user_id = owner;
    newMember.organisation_id = newOrganisation;

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
}
