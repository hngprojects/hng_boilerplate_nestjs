import { Testimonial } from '../entities/testimonials.entity';

export class TestimonialResponseMapper {
  static mapToEntity(testimonial: Testimonial) {
    if (!testimonial) throw new Error('Testimonial is required');

    return {
      id: testimonial.id,
      author: testimonial.name,
      content: testimonial.content,
      comments: [],
      created_at: testimonial.created_at,
    };
  }
}
