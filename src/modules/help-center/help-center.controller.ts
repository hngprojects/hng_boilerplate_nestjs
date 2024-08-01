import { Controller, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { HelpCenterService } from './help-center.service';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('help-center')
@ApiBearerAuth()
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @Patch('topics/:id')
  @ApiOperation({ summary: 'Update a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(@Param('id') id: string, @Body() updateHelpCenterDto: UpdateHelpCenterDto) {
    try {
      const updatedHelpCenter = await this.helpCenterService.updateTopic(id, updateHelpCenterDto);
      return {
        success: true,
        message: 'Topic updated successfully',
        data: updatedHelpCenter,
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      } else if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  @Delete('topics/:id')
  //@Roles('superadmin')
  @ApiOperation({ summary: 'Delete a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param('id') id: string) {
    try {
      await this.helpCenterService.removeTopic(id);
      return {
        success: true,
        message: 'Topic deleted successfully',
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      } else if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
