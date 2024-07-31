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
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Express, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource
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

  async updateUserProfilePicture(
    file: Express.Multer.File,
    userId: string,
    reqUrl: string,
    uploadProfilePicFolder: string
  ) {
    try {
      const newFileName = `profile-pic__${userId}--${Date.now()}${path.extname(file.originalname)}`;

      const user: User = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
      if (!user)
        throw new UnauthorizedException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'The logged in user provided is invalid',
        });

      const userProfile = new Profile();
      Object.assign(userProfile, { ...user.profile });
      userProfile.profile_pic_url = newFileName;
      userProfile.email = user.email;
      if (!user.profile) userProfile.user_id = user;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        if (user.profile && user.profile.profile_pic_url)
          await fs.promises.rmdir(path.join(uploadProfilePicFolder, user.profile.profile_pic_url));

        await queryRunner.manager.update(Profile, { user_id: user.id, email: user.email }, userProfile);
        await fs.promises.rename(file.path, path.join(uploadProfilePicFolder, newFileName));
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Profile picture updated successfully',
        data: { profile_picture_url: `${reqUrl}/${userProfile.profile_pic_url}` },
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

  async getProfilePic(picName: string, res: Response, uploadProfilePicFolder: string) {
    try {
      const picPath = path.join(uploadProfilePicFolder, picName);
      const picture = await fs.promises.readFile(picPath);

      res.setHeader('Content-Type', 'image/*');
      return res.send(picture);
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
