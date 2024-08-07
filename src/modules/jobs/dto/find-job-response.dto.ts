import { Job } from '../entities/job.entity';

export class FindJobResponseDto {
  message: string;
  status_code: number;
  data: Job;
}
