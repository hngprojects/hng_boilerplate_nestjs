import { IsString, IsUUID, IsBoolean, IsEmail, isObject, IsObject } from 'class-validator';
import { Organisation } from '../../organisations/entities/organisations.entity';

export class InviteDto {
  @IsUUID()
  id: string;

  @IsString()
  token: string;

  @IsObject()
  organisation: Organisation;

  @IsEmail()
  email?: string;

  @IsBoolean()
  isGeneric: boolean;

  @IsBoolean()
  isAccepted: boolean;
}
