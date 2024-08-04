import { PartialType } from '@nestjs/swagger';
import { CreateNewsletterDto } from './create-newsletter.dto';

export class UpdateNewsletterDto extends PartialType(CreateNewsletterDto) {}
