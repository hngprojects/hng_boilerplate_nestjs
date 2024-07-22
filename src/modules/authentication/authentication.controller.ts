import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RequestSignInTokenDto, VerifySignInTokenDto } from './authentication.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signin-token')
  async requestSignInToken(@Body() requestSignInTokenDto: RequestSignInTokenDto) {
    const { email } = requestSignInTokenDto;

    try {
      await this.authService.requestSignInToken(email);
      return { message: 'Sign-in token sent to email', status_code: 200 };
    } catch (error) {
      throw new BadRequestException('Failed to send sign-in token');
    }
  }

  @Post('verify-signin-token')
  async verifySignInToken(@Body() verifySignInTokenDto: VerifySignInTokenDto) {
    const { email, token } = verifySignInTokenDto;

    try {
      const result = await this.authService.verifySignInToken(email, token);
      return { message: 'Sign-in successful', token: result.token, status_code: 200 };
    } catch (error) {
      throw new UnauthorizedException('Invalid token or email');
    }
  }
}
