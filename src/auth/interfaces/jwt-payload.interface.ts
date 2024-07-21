export interface JwtPayload {
    id: string; 
    first_name: string; 
    last_name: string;
    email: string;
    is_active?: boolean;
    attempts_left?: number; 
    time_left?: number;
  }
  