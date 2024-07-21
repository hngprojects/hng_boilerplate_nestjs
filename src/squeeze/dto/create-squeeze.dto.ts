import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

/*
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "08098761234",
  "location": "Lagos, Nigeria",
  "job_title": "Software Engineer",
  "company": "X-Corp",
  "interests": ["Web Development", "Cloud Computing"],
  "referral_source": "LinkedIn"
}
 */

export class CreateSqueezeDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  job_title: string;

  @IsNotEmpty()
  company: string;

  @IsNotEmpty()
  referral_source: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  interests: string[];
}
