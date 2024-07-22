// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface'; 

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_active: user.is_active,
      attempts_left: user.attempts_left,
      time_left: user.time_left,
    };

    return this.jwtService.sign(payload);
  }
}
