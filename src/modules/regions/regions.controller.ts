import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { Regions } from './entities/region.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}
  @ApiOperation({ summary: 'Get supported regions' })
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
  @Get()
  async findAll(): Promise<any> {
    try {
      const regions = await this.regionsService.getAllRegions();
      const formattedRegions = regions.map(region => ({
        id: region.id,
        region: region.regionName,
      }));
      return {
        status: 'success',
        data: {
          regions: formattedRegions,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'You are not authorized for this action',
          status_code: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
