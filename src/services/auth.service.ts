import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';
import { Payload } from 'src/interfaces/auth.interface';
import { LoginDto } from 'src/dto/auth.dto';
import { RefreshToken } from 'src/entities/refreshToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(loginData: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginData.email } });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        error: 'Invalid credentials',
        status_code: HttpStatus.UNAUTHORIZED,
      });
    }

    const isPassword = await bcrypt.compare(loginData.password, user.password);

    if (!isPassword) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        error: 'Invalid credentials',
        status_code: HttpStatus.UNAUTHORIZED,
      });
    }

    const { password, ...data } = user;

    const tokens = await this.generateTokens({
      email: data.email,
      user_id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    return { data, tokens };
  }

  async generateTokens(payload: Payload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_PRIVATE_KEY'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRESIN'),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_PRIVATE_KEY'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRESIN'),
      }),
    ]);

    this.storeRefreshToken(payload.user_id, refreshToken);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    this.refreshTokenRepository.create({ token: refreshToken, user: userId, expiryDate });
  }
}
