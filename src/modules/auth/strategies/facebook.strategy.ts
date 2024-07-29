import { HttpCode, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import UserService from '../../user/user.service';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}api/v1/auth/facebook/redirect`,
      scope: 'email',
      profileFields: ['name', 'emails'],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<LoginResponseDto> {
    const { name, emails } = profile;
    const { familyName, givenName } = name;

    try {
      const user = await this.userService.getUserRecord({
        identifier: emails[0].value,
        identifierType: 'email',
      });

      if (user) {
        return {
          message: 'Successfully logged in!',
          access_token,
          data: {
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
            },
          },
        };
      }

      const newUserDetails = {
        first_name: givenName,
        last_name: familyName,
        email: emails[0].value,
        password: `${name.middleName}-facebook123`,
      };

      await this.userService.createUser(newUserDetails);

      const newUser = await this.userService.getUserRecord({
        identifier: newUserDetails.email,
        identifierType: 'email',
      });

      const payload = {
        message: 'Account created successfully!',
        access_token,
        data: {
          user: {
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
          },
        },
      };

      return payload;
    } catch (err) {
      throw new InternalServerErrorException(HttpStatus.BAD_REQUEST, { description: 'Authentication failed' });
    }
  }
}
