import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { UploadProfilePicDto } from './dto/upload-profile-pic.dto';
import { PROFILE_PHOTO_UPLOADS } from '../../helpers/app-constants';
import { pipeline, Readable } from 'stream';

@Injectable()
export class ProfileService {
  private uploadsDir: string;

  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    this.uploadsDir = PROFILE_PHOTO_UPLOADS;
    this.createUploadsDirectory().catch(error => {
      console.error('Failed to create uploads directory:', error);
    });
  }

  async findOneProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userProfile = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      const profile = userProfile.profile;
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      const responseData = {
        message: 'Successfully fetched profile',
        data: profile,
      };

      return responseData;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const profile = user.profile;
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      await this.profileRepository.update(profile.id, updateProfileDto);

      const updatedProfile = await this.profileRepository.findOne({ where: { id: profile.id } });

      const responseData = {
        message: 'Profile successfully updated',
        data: updatedProfile,
      };

      return responseData;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }
  async deleteUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    const userProfile = await this.profileRepository.findOne({
      where: { id: user.profile.id },
    });

    if (!userProfile) {
      throw new NotFoundException('Profile not found');
    }

    await this.profileRepository.softDelete(userProfile.id);

    const responseData = {
      message: 'Profile successfully deleted',
    };

    return responseData;
  }

  async uploadProfilePicture(
    userId: string,
    uploadProfilePicDto: UploadProfilePicDto,
    baseUrl: string
  ): Promise<{ status: string; message: string; data: { profile_picture_url: string } }> {
    if (!uploadProfilePicDto.avatar) {
      throw new CustomHttpException(SYS_MSG.NO_FILE_FOUND, HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const profile = user.profile;
    if (!profile) {
      throw new CustomHttpException(SYS_MSG.PROFILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (profile.profile_pic_url) {
      const previousFilePath = path.join(this.uploadsDir, path.basename(profile.profile_pic_url));

      try {
        await fs.promises.access(previousFilePath);
        await fs.promises.unlink(previousFilePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error(SYS_MSG.PROFILE_PIC_NOT_FOUND, previousFilePath);
        } else {
          throw new CustomHttpException(SYS_MSG.PROFILE_PIC_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }

    const fileExtension = path.extname(uploadProfilePicDto.avatar.originalname);
    const fileName = `${userId}${fileExtension}`;
    const filePath = path.join(this.uploadsDir, fileName);

    const fileStream = Readable.from(uploadProfilePicDto.avatar.buffer);
    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      pipeline(fileStream, writeStream, async err => {
        if (err) {
          Logger.error(SYS_MSG.FILE_SAVE_ERROR, err.stack);
          reject(new CustomHttpException(SYS_MSG.FILE_SAVE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          await sharp(uploadProfilePicDto.avatar.buffer).resize({ width: 200, height: 200 }).toFile(filePath);

          profile.profile_pic_url = `${baseUrl}/uploads/${fileName}`;

          await this.profileRepository.update(profile.id, profile);
          const updatedProfile = await this.profileRepository.findOne({ where: { id: profile.id } });
          resolve({
            status: "success",
            message: SYS_MSG.PICTURE_UPDATED,
            data: { profile_picture_url: updatedProfile.profile_pic_url },
          });
        }
      });
    });

  }

  private async createUploadsDirectory() {
    try {
      await fs.promises.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error(SYS_MSG.ERROR_DIRECTORY, error);
    }
  }
}
