import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../entities/organisation.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class OrganizationService {
  [x: string]: any;
  constructor(
    @InjectRepository(Organisation) private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async getUsers(orgId: string, page: number, pageSize: number): Promise<User[]> {
    const organisation = await this.organisationRepository.findOne({ where: { org_id: orgId }, relations: ['users'] });

    if (!organisation) {
      throw new NotFoundException('Organization not found');
    }

    const users = organisation.users;

    // Pagination logic
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return users.slice(startIndex, endIndex);
  }

  async isUserMemberOfOrganization(userId: string, orgId: string): Promise<boolean> {
    const organisation = await this.organisationRepository.findOne({ where: { org_id: orgId }, relations: ['users'] });

    if (!organisation) {
      throw new NotFoundException('Organization not found');
    }

    return organisation.users.some(user => user.id === userId);
  }
}
