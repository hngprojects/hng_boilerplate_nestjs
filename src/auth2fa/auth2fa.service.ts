import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Auth2FAService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async enable2FA(user_id: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
    });
    if (!user) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'User not found',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid password',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const secret = speakeasy.generateSecret({ length: 32 });
    user.secret = secret.base32;
    await this.userRepository.save(user);

    const qr_code_url = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `Hng:${user.email}`,
      issuer: 'Hng Boilerplate',
    });
    return { secret: secret.base32, qr_code_url };
  }

  async verify2FA(user_id: string, totp_code: string) {
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'User not found',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.secret) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: '2FA not enabled',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: totp_code,
    });
    if (!isVerified) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid TOTP code',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    user.is_2fa_enabled = true;
    await this.userRepository.save(user);

    return { message: '2FA has been verified' };
  }

  async disable2FA(user_id: string, password: string, totp_code: string) {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'User not found',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid password',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: totp_code,
    });

    if (!isVerified) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid TOTP code',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    user.secret = null;
    user.is_2fa_enabled = false;
    await this.userRepository.save(user);

    return { message: '2FA has been disabled' };
  }
}
