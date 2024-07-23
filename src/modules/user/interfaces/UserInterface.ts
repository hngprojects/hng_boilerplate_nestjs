interface UserInterface {
    id: string;
  
    email: string;
  
    first_name: string;
  
    last_name: string;
  
    password: string;
  
    is_active: boolean
  
    attempts_left: number
  
    time_left: number
  
    created_at: Date;
  
    updated_at: Date;
  
  }
  
  export default UserInterface