import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  async decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}
