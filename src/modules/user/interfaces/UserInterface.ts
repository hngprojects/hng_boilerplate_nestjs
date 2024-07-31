import { Profile } from 'src/modules/profile/entities/profile.entity';
import { UserType } from '../entities/user.entity';

interface UserInterface {
  id: string;

  email: string;

  first_name: string;

  last_name: string;

  password: string;
  
  is_2fa_enabled: boolean;

  backup_codes_2fa: string;

  secret: string;

  user_type: UserType;

  is_active: boolean;

  attempts_left: number;

  time_left: number;

  created_at: Date;

  updated_at: Date;

  phone_number?: string;

  profile?: Profile;
}

export default UserInterface;
