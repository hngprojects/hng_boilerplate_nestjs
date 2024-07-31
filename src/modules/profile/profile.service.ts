import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async createProfile(createProfileDto: CreateProfileDto, userId: string) {
    try {
      // Fetch the user entity by userId
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if a profile for this user already exists
      const existingProfile = await this.profileRepository.findOne({ where: { id: userId } });
      if (existingProfile) {
        throw new BadRequestException('Profile already exists');
      }
      const profile = this.profileRepository.create({ ...createProfileDto, user_id: user });
      await this.profileRepository.save(profile);

      const newProfile = await this.profileRepository.findOne({ where: { id: profile.id } });

      if (!newProfile) {
        throw new BadRequestException('Profile creation unsuccessful');
      }
      return newProfile;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

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
}
