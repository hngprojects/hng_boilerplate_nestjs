import { TestimonialData } from '../interfaces/testimonials.interface';

export class CreateTestimonialResponseDto {
  'status': string;
  'message': string;
  'data': TestimonialData;
}
