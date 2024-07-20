import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { comparePasswords } from 'src/utils';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) return { message: 'Invalid credentials', error: 'Bad request', status_code: HttpStatus.BAD_REQUEST };

    const isPassword = await comparePasswords(password, user.password);

    if (!isPassword)
      return { message: 'Invalid credentials', error: 'Bad request', status_code: HttpStatus.BAD_REQUEST };
  }

  async generateAccessToken();
}
