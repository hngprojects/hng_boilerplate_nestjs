import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { AddMemberToOrganisationDto } from './dto/add-user-dto';
import { AddMemberToOrganisationMapper } from './mapper/add-member-to-org.mapper';
import { OrganisationMembersResponseDto } from './dto/org-members-response.dto';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationMember } from './entities/org-members.entity';
import { Organisation } from './entities/organisations.entity';
import { CreateOrganisationMapper } from './mapper/create-organisation.mapper';
import { OrganisationMemberMapper } from './mapper/org-members.mapper';
import { OrganisationMapper } from './mapper/organisation.mapper';

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

    if (!owner) {
      throw new Error('Owner not found');
    }

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

  async addMember(orgId: string, userId: string, currentUserId: string) {
    try {
      const org = await this.checkIfOrgExists(orgId);

      if (!this.verifyOwner(org, currentUserId)) {
        throw new UnauthorizedException({
          status: 'Forbidden',
          message: 'Only admins can add users',
          status_code: 403,
        });
      }

      const user = await this.checkIfUserExists(userId);

      const isUserAMember = await this.checkIfUserIsMember(userId, orgId);

      if (isUserAMember > 0) {
        throw new ConflictException({
          status: 'error',
          message: 'User is already a member of this organisation',
          status_code: 409,
        });
      }

      const addMemberDto: AddMemberToOrganisationDto = {
        user_id: user,
        organisation_id: org,
        role: 'user',
        profile_id: user.profile,
      };

      const newMemberMapped = AddMemberToOrganisationMapper.mapToEntity(addMemberDto);
      org.organisationMembers.push(newMemberMapped);

      await this.organisationRepository.save(org);

      return {
        status: 'Success',
        message: 'User added successfully',
        status_code: 200,
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof UnauthorizedException ||
        err instanceof ConflictException
      ) {
        throw err;
      } else {
        console.error(err);
        throw new InternalServerErrorException(`An internal server error occurred: ${err.message}`);
      }
    }
  }

  async checkIfOrgExists(orgId: string) {
    const org = await this.organisationRepository.findOne({
      where: {
        id: orgId,
      },
    });
    if (!org) {
      throw new NotFoundException({
        status: 'error',
        message: 'Organisation not found',
        status_code: 404,
      });
    }

    return org;
  }

  async checkIfUserExists(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException({
        status: 'error',
        message: 'User not found',
        status_code: 404,
      });
    }

    return user;
  }

  verifyOwner(org: Organisation, ownerId: string) {
    return org.owner.id == ownerId;
  }

  async checkIfUserIsMember(userId: string, orgId: string) {
    const count = await this.organisationMemberRepository
      .createQueryBuilder('member')
      .where('member.user_id = :userId', { userId })
      .andWhere('member.organisation_id = :orgId', { orgId })
      .getCount();

    return count;
  }
}
