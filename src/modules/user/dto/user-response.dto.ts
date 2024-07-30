import UserInterface from '../interfaces/UserInterface';

class ErrorCreateUserResponse {
  status_code: number;
  message: string;
}

class SuccessCreateUserResponse {
  status_code: number;
  message: string;
  data: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
      created_at: Date;
    };
  };
}

export { ErrorCreateUserResponse, SuccessCreateUserResponse };

type UserResponseDTO = Partial<UserInterface>;
export default UserResponseDTO;
