import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: "Team member's name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Team member's title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Team member's description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Team member's image" })
  @IsString()
  image: string;

  @ApiProperty({ description: "Team member's facebook profile link" })
  @IsString()
  facebook: string;

  @ApiProperty({ description: "Team member's twitter profile link" })
  @IsString()
  twitter: string;

  @ApiProperty({ description: "Team member's instagram profile link" })
  @IsString()
  instagram: string;
}
