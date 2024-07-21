import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../entities/organisation.entity';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>
  ) {}

  async findById(orgId: string): Promise<Organisation> {
    return this.organisationsRepository.findOne({
      where: { org_id: orgId },
    });
  }
}
