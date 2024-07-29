interface GetUsersStatsResponseDTO {
  status: string;
  status_code: number;
  message: string;
  data: {
    total_users: number;
    active_users: number;
    deleted_users: number;
  };
}

export default GetUsersStatsResponseDTO;
