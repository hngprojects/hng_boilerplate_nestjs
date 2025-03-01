import { Body, Controller, Post, Request, Put, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SqueezeService } from './squeeze.service';
import { SqueezeRequestDto } from './dto/squeeze.dto';
import { skipAuth } from '@shared/helpers/skipAuth';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Delete } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';

@ApiTags('Squeeze')
@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly SqueezeService: SqueezeService) {}

  @ApiOperation({ summary: `Create squeeze record` })
  @skipAuth()
  @Post('/')
  async create(@Body() createSqueezeDto: SqueezeRequestDto, @Request() req) {
    return this.SqueezeService.create(createSqueezeDto);
  }

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
    const updatedSqueeze = await this.SqueezeService.updateSqueeze(updateDto);
    return {
      message: 'Your record has been successfully updated. You cannot update it again.',
      status_code: 200,
      data: {
        ...updatedSqueeze,
      },
    };
  }

  @Delete(':squeezeId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Squeeze Record' })
  @ApiOkResponse({
    description: 'Squeeze Records Deleted Successfully',
    type: 'object',
    example: {
      message: 'Success',
      status: 200,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is Unauthorized',
    type: 'object',
    example: {
      message: 'User is currently unauthorized, kindly authenticate to continue',
      status: 401,
    },
  })
  @ApiForbiddenResponse({
    description: 'User is forbidden',
    example: {
      message: "You don't have the permission to perform this action",
      status: 403,
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteSqueeze(@Param('squeezeId', ParseUUIDPipe) squeezeId: string, @Request() req) {
    const authenticatedSqueezeId = req['squeeze'].id;
    return this.SqueezeService.deleteSqueeze(squeezeId, authenticatedSqueezeId);
  }
}
