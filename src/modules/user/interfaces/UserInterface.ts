interface UserInterface {
  id: string;

  email: string;

  first_name: string;

  last_name: string;

  password: string;

  is_active: boolean;

  two_factor_secret: string;

  is_two_factor_enabled: boolean;

  backup_codes: string[];

  attempts_left: number;

  time_left: number;

  created_at: Date;

  updated_at: Date;
}

export default UserInterface;
