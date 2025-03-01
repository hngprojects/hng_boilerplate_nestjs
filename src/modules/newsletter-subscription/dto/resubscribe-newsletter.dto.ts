import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ResubscribeNewsletterDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  validateUserIdentifier?() {
    if (!this.id && !this.email) {
      throw new Error('Either userId or email must be provided.');
    }
  }
}
