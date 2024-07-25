interface UserInterface {
  id: string;

  email: string;

  first_name: string;

  last_name: string;

  password: string;

  backup_codes: string[];

  secret: string;

  is_2fa_enabled: boolean;

  is_active: boolean;

  attempts_left: number;

  time_left: number;

  created_at: Date;

  updated_at: Date;

  phone_number?: string;
}

export default UserInterface;
