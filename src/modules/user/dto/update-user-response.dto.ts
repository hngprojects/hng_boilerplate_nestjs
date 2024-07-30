interface UpdateUserResponseDTO {
  status: string;
  message: string;
  user: {
    id: string;
    name: string;
    phone_number: string;
  };
}

export default UpdateUserResponseDTO;
