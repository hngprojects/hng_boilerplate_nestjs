import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Regions } from './entities/region.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Regions)
    private regionsRepository: Repository<Regions>
  ) {}

  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({
    status: 200,
    description: 'The regions have been successfully fetched.',
    schema: {
      example: {
        status: 'success',
        data: {
          regions: [
            {
              id: 'string',
              region: 'String',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAllRegions(): Promise<Regions[]> {
    return await this.regionsRepository.find();
  }
}
