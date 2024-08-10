import {

  Injectable,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { isUUID } from 'class-validator';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { INVALID_CREDENTIALS, OK, REQUEST_SUCCESSFUL, USER_NOT_FOUND } from '../../helpers/SystemMessages';

@Injectable()
export class ProfileService {

  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
  }

  async findOneProfile(userId: string) {
    if (!isUUID(userId, '4')) {
      throw new CustomHttpException(INVALID_CREDENTIALS, 400);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

      const userProfile = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

    const profile = userProfile.profile;
    if (!profile) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

    const responseData = {
      message: REQUEST_SUCCESSFUL,
      data: profile,
    };

    return responseData;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

    const profile = user.profile;
    if (!profile) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

    await this.profileRepository.update(profile.id, updateProfileDto);

    const updatedProfile = await this.profileRepository.findOne({ where: { id: profile.id } });

    const responseData = {
      message: OK,
      data: updatedProfile,
    };

    return responseData;
  }
  async deleteUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });

    if (!user || !user.profile) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

    const userProfile = await this.profileRepository.findOne({
      where: { id: user.profile.id },
    });

    if (!userProfile) {
      throw new CustomHttpException(USER_NOT_FOUND, 404);
    }

    await this.profileRepository.softDelete(userProfile.id);

    const responseData = {
      message: REQUEST_SUCCESSFUL,
    };

    return responseData;
  }

}
