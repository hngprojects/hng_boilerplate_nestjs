// src/scripts/generate-jwt-token.ts
import * as jwt from 'jsonwebtoken';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const user = await usersService.findByEmail('peterson.doe@example.com');
  console.log(user);
  if (!user) {
    throw new Error('User not found');
  }

  const payload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_active: user.is_active,
    attempts_left: user.attempts_left,
    time_left: user.time_left,
  };

  const secret = 'appsecret';
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  console.log('JWT Token:', token);

  await app.close();
}

bootstrap();
