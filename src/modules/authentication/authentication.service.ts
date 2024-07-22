import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import * as moment from 'moment';

@Injectable()
export class AuthenticationService {
  private transporter;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_USER_PASSWORD,
      },
    });
  }

  async requestSignInToken(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Invalid email address');
    }

    const token = randomInt(100000, 999999).toString();
    const expiryTime = moment().add(5, 'minutes').unix(); // 5 minutes from now

    user.token = token;
    user.time_left = expiryTime;
    await this.userRepository.save(user);

    await this.transporter.sendMail({
      from: '"HNG" <noreply@example.com>',
      to: email,
      subject: 'Your Sign-In Token',
      text: `Your sign-in token is ${token}`,
    });
  }

  async verifySignInToken(email: string, token: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email, token } });

    if (!user) {
      throw new UnauthorizedException('Invalid token or email');
    }

    const currentTime = moment().unix();
    if (currentTime > user.time_left) {
      throw new UnauthorizedException('Token has expired');
    }

    user.token = null;
    user.time_left = null;
    await this.userRepository.save(user);

    const payload = { id: user.id, email: user.email };
    const jwt = this.jwtService.sign(payload);

    return { token: jwt };
  }
}
