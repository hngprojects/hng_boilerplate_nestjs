import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import * as SYS_MSG from '../../../helpers/SystemMessages';

export class CreateContactResponseDto {
  @ApiProperty({
    description: 'Status code for successfull inquiry.',
    example: HttpStatus.CREATED,
  })
  status_code: number;

  @ApiProperty({ description: 'Response message for sent enquiry', example: SYS_MSG.INQUIRY_SENT })
  messsage: string;
}
