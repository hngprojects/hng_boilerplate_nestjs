export class helpCenterTopicDto {
  id: string;
  title: string;
  content: string;
  author: string;
}

export class helpCenterTopicSuccessResponseDto {
  success: boolean;
  message: string;
  status_code: number;
  topics: helpCenterTopicDto[];
}

export class helpCenterTopicErrorResponseDto {
  success: boolean;
  message: string;
  status_code: number;
}
