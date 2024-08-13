import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ParseUUIDPipe,
  UploadedFile,
  Req,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../shared/inteceptors/response.interceptor';
import { UploadProfilePicDto } from './dto/upload-profile-pic.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidator } from './dto/file.validator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  BASE_URL,
  MAX_PROFILE_PICTURE_SIZE,
  VALID_UPLOADS_MIME_TYPES,
} from '../../helpers/app-constants';


@ApiBearerAuth()
@ApiTags('Profile')
@Controller('profile')
@UseInterceptors(ResponseInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @Get(':userId')
  findOneProfile(@Param('userId') userId: string) {
    const profile = this.profileService.findOneProfile(userId);
    return profile;
  }

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The updated record',
  })
  @Patch(':userId')
  updateProfile(@Param('userId', ParseUUIDPipe) userId: string, @Body() body: UpdateProfileDto) {
    const updatedProfile = this.profileService.updateProfile(userId, body);
    return updatedProfile;
  }

  @ApiOperation({ summary: 'Delete User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The deleted record',
  })
  @Delete(':userId')
  async deleteUserProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.profileService.deleteUserProfile(userId);
  }

  @ApiOperation({ summary: 'Upload Profile Picture' })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
  })
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  type: UploadProfilePicDto,
  description: 'Profile picture file',
})

  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile(
      new FileValidator({
        maxSize:   MAX_PROFILE_PICTURE_SIZE,
        mimeTypes: VALID_UPLOADS_MIME_TYPES,
      })
    )
    file: Express.Multer.File
  ): Promise<{
    status: string;
    message: string
  }> {
    const userId = req.user.id;
    const uploadProfilePicDto = new UploadProfilePicDto()
    uploadProfilePicDto.avatar = file
    return await this.profileService.uploadProfilePicture(userId, uploadProfilePicDto, BASE_URL)
  }
}
