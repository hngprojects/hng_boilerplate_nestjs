import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
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

    if (!user) throw new UnauthorizedException('Invalid email or Password');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid email or Password');

    const access_token = await Utils.assignJwtToken(user.id, this.jwtService);

    const refresh_token = await Utils.assignRefreshJwtToken(user.id, this.jwtService);

    return { message: 'Login successful', data: user, access_token, refresh_token };
  }
}
