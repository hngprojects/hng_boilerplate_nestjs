import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomHttpException } from 'src/shared/custom-http-filter';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import Utils from '../../shared/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<{}> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOneBy({ email });

    if (!user)
      throw new CustomHttpException(
        { message: 'Invalid password or email', error: 'Bad Request' },
        HttpStatus.UNAUTHORIZED
      );

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      throw new CustomHttpException(
        { message: 'Invalid password or email', error: 'Bad Request' },
        HttpStatus.UNAUTHORIZED
      );

    const access_token = await Utils.assignJwtToken(user.id, this.jwtService);

    const refresh_token = await Utils.assignRefreshJwtToken(user.id, this.jwtService);

    delete user.password;

    return { message: 'Login successful', data: user, access_token, refresh_token };
  }
}
