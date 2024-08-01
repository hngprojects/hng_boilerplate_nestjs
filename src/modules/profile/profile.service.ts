import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Express } from 'express';
import { extname } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UNAUTHENTICATED_MESSAGE, USER_PROFILE_NOT_FOUND } from '../../helpers/SystemMessages';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async findOneProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const profile = await this.profileRepository.findOne({ where: { user_id: { id: userId } } });
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

  async updateUserProfilePicture(file: Express.Multer.File, userId: string) {
    try {
      const user: User = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
      if (!user) {
        throw new UnauthorizedException({ status: HttpStatus.UNAUTHORIZED, message: UNAUTHENTICATED_MESSAGE });
      }

      const userProfile = await this.profileRepository.findOne({ where: { user_id: { id: userId } } });
      if (!userProfile) {
        throw new NotFoundException({ status: HttpStatus.NOT_FOUND, message: USER_PROFILE_NOT_FOUND });
      }

      const newFilename = `profile-pic__${userId}--${Date.now()}${extname(file.originalname)}`;
      // upload the app to cloud and save the returned url
      await this.profileRepository.update(userProfile.id, { profile_pic_url: newFilename });

      return {
        status: HttpStatus.CREATED,
        message: 'Profile picture updated successfully',
        data: { profile_picture_url: newFilename },
      };
    } catch (error) {
      Logger.log(error);
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error ocured while processing your request',
        error: error.message,
      });
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const profile = await this.profileRepository.findOne({ where: { user_id: { id: userId } } });
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // Update profile data
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
}
