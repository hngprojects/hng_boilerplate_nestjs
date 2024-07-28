interface EmailResponseDTO {
  status: string;
  message: string;
  data: {
    template: string;
  };
}

export default EmailResponseDTO;
