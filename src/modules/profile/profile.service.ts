import { profile } from 'console';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }
}
