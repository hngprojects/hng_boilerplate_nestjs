import { User } from '../../../modules/user/entities/user.entity';

export class CreateAdminResponseDto {
  status: number;
  data: User;
  message: string;
}
