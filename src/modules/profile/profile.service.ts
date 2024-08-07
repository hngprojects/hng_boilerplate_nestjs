import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DeactivateProfileDto } from './dto/deactivate-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async findOneProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const profile = user.profile;
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      const responseData = {
        message: 'Successfully fetched profile',
        data: profile,
      };

      return responseData;
    } catch (error) {
      if (error instanceof NotFoundException) {
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  async deactivateProfile(userId: string, deactivateProfileDto: DeactivateProfileDto): Promise<Profile> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const profile = user.profile;
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      if (profile.deactivated) {
        throw new UnauthorizedException('Profile already deactivated');
      }

      profile.deactivated = true;
      profile.deactivation_reason = deactivateProfileDto.reason || 'No reason provided';
      await this.profileRepository.save(profile);

      return profile;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }
}
