import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import UserService from '../user/user.service';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RequestSigninTokenDto } from './dto/request-signin-token.dto';
import { OtpDto } from '../otp/dto/otp.dto';
import { GoogleAuthService } from './google-auth.service';
import GoogleAuthPayload from './interfaces/GoogleAuthPayloadInterface';
import { GoogleVerificationPayloadInterface } from './interfaces/GoogleVerificationPayloadInterface';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { OrganisationsService } from '../organisations/organisations.service';

@Injectable()
export default class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private googleAuthService: GoogleAuthService,
    private organisationService: OrganisationsService
  ) {}

  async createNewUser(createUserDto: CreateUserDTO) {
    const userExists = await this.userService.getUserRecord({
      identifier: createUserDto.email,
      identifierType: 'email',
    });

    if (userExists) {
      throw new CustomHttpException(SYS_MSG.USER_ACCOUNT_EXIST, HttpStatus.BAD_REQUEST);
    }

    await this.userService.createUser(createUserDto);

    const user = await this.userService.getUserRecord({ identifier: createUserDto.email, identifierType: 'email' });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.FAILED_TO_CREATE_USER, HttpStatus.BAD_REQUEST);
    }
    const newOrganisationPaload = {
      name: `${user.first_name}'s Organisation`,
      description: '',
      email: user.email,
      industry: '',
      type: '',
      country: '',
      address: '',
      state: '',
    };

    await this.organisationService.create(newOrganisationPaload, user.id);

    const token = (await this.otpService.createOtp(user.id)).token;

    const access_token = this.jwtService.sign({ id: user.id, sub: user.id, email: user.email });

    const responsePayload = {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.profile.profile_pic_url,
      },
    };

    return {
      message: SYS_MSG.USER_CREATED_SUCCESSFULLY,
      access_token,
      data: responsePayload,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string } | null> {
    const user = await this.userService.getUserRecord({ identifier: dto.email, identifierType: 'email' });
    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_ACCOUNT_DOES_NOT_EXIST, HttpStatus.BAD_REQUEST);
    }

    const token = (await this.otpService.createOtp(user.id)).token;
    await this.emailService.sendForgotPasswordMail(user.email, `${process.env.BASE_URL}/auth/reset-password`, token);

    return {
      message: SYS_MSG.EMAIL_SENT,
    };
  }

  async updateForgotPassword(updatePasswordDto: UpdatePasswordDto) {
    const { email, newPassword, otp } = updatePasswordDto;

    const exists = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });
    if (!exists) throw new CustomHttpException(SYS_MSG.USER_ACCOUNT_DOES_NOT_EXIST, HttpStatus.NOT_FOUND);

    const user = await this.otpService.retrieveUserAndOtp(exists.id, otp);

    // return this.userService.updateUser(user.id, { password: newPassword }, user);
  }

  async changePassword(user_id: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.getUserRecord({
      identifier: user_id,
      identifierType: 'id',
    });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomHttpException(SYS_MSG.INVALID_PASSWORD, HttpStatus.BAD_REQUEST);
    }

    await this.userService.updateUserRecord({
      updatePayload: { password: newPassword },
      identifierOptions: {
        identifierType: 'id',
        identifier: user.id,
      },
    });

    return {
      message: SYS_MSG.PASSWORD_UPDATED,
    };
  }

  async loginUser(loginDto: LoginDto): Promise<LoginResponseDto | { status_code: number; message: string }> {
    const { email, password } = loginDto;

    const user = await this.userService.getUserRecord({
      identifier: email,
      identifierType: 'email',
    });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new CustomHttpException(SYS_MSG.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const access_token = this.jwtService.sign({ id: user.id, sub: user.id });

    const responsePayload = {
      access_token,
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar_url: user.profile && user.profile.profile_pic_url ? user.profile.profile_pic_url : null,
        },
      },
    };

    return { message: SYS_MSG.LOGIN_SUCCESSFUL, ...responsePayload };
  }

  private async validateUserAndPassword(user_id: string, password: string) {
    const user = await this.userService.getUserRecord({
      identifier: user_id,
      identifierType: 'id',
    });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomHttpException(SYS_MSG.INVALID_PASSWORD, HttpStatus.BAD_REQUEST);
    }

    return { user, isValid: true };
  }

  async enable2FA(user_id: string, password: string) {
    const { user, isValid } = await this.validateUserAndPassword(user_id, password);

    if (!isValid) {
      throw new InternalServerErrorException(SYS_MSG.ENABLE_2FA_ERROR);
    }

    if (user.is_2fa_enabled) {
      throw new CustomHttpException(SYS_MSG.ALREADY_ENABLED_2FA, HttpStatus.BAD_REQUEST);
    }

    const secret = speakeasy.generateSecret({ length: 32 });
    const payload = {
      secret: secret.base32,
      is_2fa_enabled: true,
    };

    await this.userService.updateUserRecord({
      updatePayload: payload,
      identifierOptions: {
        identifierType: 'id',
        identifier: user.id,
      },
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `Hng:${user.email}`,
      issuer: 'Hng Boilerplate',
    });

    return {
      message: SYS_MSG.TWO_FA_INITIATED,
      data: {
        secret: secret.base32,
        qr_code_url: qrCodeUrl,
      },
    };
  }
  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 5; i++) {
      codes.push(Math.floor(10000000 + Math.random() * 90000000).toString());
    }
    return codes;
  }

  async verify2fa(verify2faDto: Verify2FADto, user_id: string) {
    const user = await this.userService.getUserRecord({ identifier: user_id, identifierType: 'id' });
    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!user.secret) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_ENABLED_2FA, HttpStatus.BAD_REQUEST);
    }

    const verify = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: verify2faDto.totp_code,
    });
    if (!verify) {
      throw new CustomHttpException(SYS_MSG.INCORRECT_TOTP_CODE, HttpStatus.BAD_REQUEST);
    }

    const backup_codes = this.generateBackupCodes();
    const payload = {
      backup_codes,
      is_2fa_enabled: true,
    };
    await this.userService.updateUserRecord({
      updatePayload: payload,
      identifierOptions: {
        identifierType: 'id',
        identifier: user.id,
      },
    });

    return {
      message: SYS_MSG.TWO_FACTOR_VERIFIED_SUCCESSFULLY,
      data: { backup_codes: backup_codes },
    };
  }

  async googleAuth(googleAuthPayload: GoogleAuthPayload) {
    const idToken = googleAuthPayload.id_token;
    const verifyTokenResponse: GoogleVerificationPayloadInterface = await this.googleAuthService.verifyToken(idToken);
    const userEmail = verifyTokenResponse.email;
    const userExists = await this.userService.getUserRecord({ identifier: userEmail, identifierType: 'email' });

    if (!userExists) {
      const userCreationPayload = {
        email: userEmail,
        first_name: verifyTokenResponse.given_name || '',
        last_name: verifyTokenResponse?.family_name || '',
        password: '',
      };
      return await this.createUserGoogle(userCreationPayload);
    }
    const accessToken = this.jwtService.sign({
      sub: userExists.id,
      id: userExists.id,
      email: userExists.email,
      first_name: userExists.first_name,
      last_name: userExists.last_name,
    });
    return {
      message: SYS_MSG.LOGIN_SUCCESSFUL,
      access_token: accessToken,
      data: {
        id: userExists.id,
        email: userExists.email,
        first_name: userExists.first_name,
        last_name: userExists.last_name,
        fullname: userExists.first_name + ' ' + userExists.last_name,
        role: '',
      },
    };
  }

  public async createUserGoogle(userPayload: CreateUserDTO) {
    const newUser = await this.userService.createUser(userPayload);
    const accessToken = await this.jwtService.sign({
      sub: newUser.id,
      id: newUser.id,
      email: userPayload.email,
      first_name: userPayload.first_name,
      last_name: userPayload.last_name,
    });

    return {
      message: SYS_MSG.USER_CREATED,
      access_token: accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        fullname: newUser.first_name + ' ' + newUser.last_name,
        role: '',
      },
    };
  }

  async requestSignInToken(requestSignInTokenDto: RequestSigninTokenDto) {
    const { email } = requestSignInTokenDto;

    const user = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
    }

    const otpExist = await this.otpService.findOtp(user.id);

    if (otpExist) {
      await this.otpService.deleteOtp(user.id);
    }

    const otp = await this.otpService.createOtp(user.id);

    await this.emailService.sendLoginOtp(user.email, otp.token);

    return {
      message: SYS_MSG.SIGN_IN_OTP_SENT,
    };
  }

  async verifyToken(verifyOtp: OtpDto) {
    const { token, email } = verifyOtp;

    const user = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });
    const otp = await this.otpService.verifyOtp(user.id, token);

    if (!user || !otp) {
      throw new CustomHttpException(SYS_MSG.UNAUTHORISED_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.sign({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      sub: user.id,
      id: user.id,
    });

    const { password, profile, ...data } = user;
    const responsePayload = {
      ...data,
      avatar_url: profile.profile_pic_url,
    };

    return {
      message: SYS_MSG.LOGIN_SUCCESSFUL,
      access_token: accessToken,
      data: responsePayload,
    };
  }
}
