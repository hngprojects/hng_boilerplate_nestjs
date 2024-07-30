import { UserType } from '../entities/user.entity';

export interface UserPayload {
  id: string;
  email: string;
  user_type: UserType;
}
