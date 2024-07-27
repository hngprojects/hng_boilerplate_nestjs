import { Body, Controller, HttpCode, Put } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Squeeze')
@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly squeezeService: SqueezeService) {}

  @skipAuth()
  @Put()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update Squeeze Record' })
  @ApiResponse({
    description: 'Squeeze record updated successfully.',
    type: UpdateSqueezeDto,
    status: 200,
  })
  @ApiResponse({
    status: 400,
    description: 'request body missing required properties',
  })
  @ApiResponse({
    status: 404,
    description: 'No squeeze page record exists for the provided request body',
  })
  @ApiResponse({
    description: 'The squeeze page record can only be updated once.',
    status: 403,
  })
  async updateSqueeze(@Body() updateDto: UpdateSqueezeDto) {
    const updatedSqueeze = await this.squeezeService.updateSqueeze(updateDto);
    return {
      message: 'Your record has been successfully updated. You cannot update it again.',
      status_code: 200,
      data: {
        ...updatedSqueeze,
      },
    };
  }
}
