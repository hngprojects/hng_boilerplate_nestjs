import { Testimonial } from '../entities/testimonials.entity';

export class TestimonialMapper {
  static mapToEntity(testimonial: Testimonial) {
    if (!testimonial) throw new Error('Testimonial is required');

    return {
      id: testimonial.id,
      name: testimonial.name,
      content: testimonial.content,
      created_at: testimonial.created_at,
    };
  }
}
