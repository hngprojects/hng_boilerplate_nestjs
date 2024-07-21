// src/scripts/insert-dummy-user.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { User } from '../entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const dummyUser: Partial<User> = {
    first_name: 'Peterson',
    last_name: 'Doe',
    email: 'peterson.doe@example.com',
    password: 'password123',
    is_active: true,
    attempts_left: 3,
    time_left: 60*60*24*365,
  };

  const createdUser = await usersService.create(dummyUser);
  console.log('Dummy User Created:', createdUser);

  await app.close();
}

bootstrap();
