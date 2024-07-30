import { IsUUID } from 'class-validator';

export class GetHelpCenterDto {
  @IsUUID('4', { message: 'Invalid UUID format for id' })
  id: string;
}
