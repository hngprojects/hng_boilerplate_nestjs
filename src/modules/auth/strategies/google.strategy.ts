import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import config from '../../../../config/auth.config';
import { User } from '../../user/entities/user.entity';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    super({
      clientID: configService.google.clientID,
      clientSecret: configService.google.clientSecret,
      callbackURL: configService.google.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      first_name: name.givenName,
      last_name: name.familyName,
      email: emails[0].value,
      password: '',
      is_active: true,
      secret: '',
      is_2fa_enabled: false,
    };

    try {
      let existingUser = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (!existingUser) {
        existingUser = this.userRepository.create(user);
        await this.userRepository.save(existingUser);
      }

      return done(null, existingUser);
    } catch (error) {
      return done(error, false);
    }
  }
}
