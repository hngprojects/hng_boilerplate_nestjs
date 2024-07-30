import UserInterface from '../interfaces/UserInterface';

export class GetUserByIdResponseDto {
  status_code: 200;
  user: Omit<Partial<UserInterface>, 'password'>;

  constructor(user: Omit<Partial<UserInterface>, 'password'>) {
    this.user = user;
  }
}
