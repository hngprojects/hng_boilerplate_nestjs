import { IsEnum } from 'class-validator';

export enum FileFormat {
  JSON = 'json',
  XLSX = 'xlsx',
}

export class UserDataExportDto {
  @IsEnum(FileFormat)
  format: FileFormat;
}
