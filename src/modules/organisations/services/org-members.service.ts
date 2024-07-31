import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../entities/org-members.entity';
import { Organisation } from '../entities/organisations.entity';

@Injectable()
export class OrganisationMembersService {
  constructor(
    @InjectRepository(OrganisationMember)
    private readonly organisationMembersRepository: Repository<OrganisationMember>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>
  ) {}

  async deleteOrganisationMember(memberId: string, ownerId: string): Promise<void> {
    const member = await this.organisationMembersRepository
      .findOneOrFail({
        where: { id: memberId },
        relations: ['organisation_id'],
      })
      .catch(() => {
        throw new NotFoundException({
          status_code: 404,
          status: 'Not Found Exception',
          message: `Organisation Member with ID ${memberId} not found`,
        });
      });

    const organisation = await this.organisationRepository
      .findOneOrFail({
        where: { id: member.organisation_id.id },
        relations: ['owner'],
      })
      .catch(() => {
        throw new ForbiddenException({
          status_code: 403,
          status: 'Forbidden Exception',
          message: 'You do not have permission to delete this organisation member',
        });
      });

    if (organisation.owner.id !== ownerId) {
      throw new ForbiddenException({
        status_code: 403,
        status: 'Forbidden Exception',
        message: 'You do not have permission to delete this organisation member',
      });
    }

    await this.organisationMembersRepository.remove(member);
  }
}
