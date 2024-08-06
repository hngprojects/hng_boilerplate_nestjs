import { IsUUID } from 'class-validator';

export class JobIdDto {
  @IsUUID()
  id: string;
}
