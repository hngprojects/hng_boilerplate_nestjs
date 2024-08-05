import { IsUUID } from 'class-validator';

export class DeleteJobDto {
  @IsUUID()
  id: string;
}
