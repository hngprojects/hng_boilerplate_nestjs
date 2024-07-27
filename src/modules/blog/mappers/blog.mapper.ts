import { User } from '../../../modules/user/entities/user.entity';
import { BlogResponseDto } from '../dto/blog-response.dto';
import { createBlogPostCategory } from '../entities/blog-category.entity';
import { BlogPost } from '../entities/blog.entity';

export class BlogMapper {
  static toResponseDto(blog: BlogPost, author: User, category: createBlogPostCategory): BlogResponseDto['data'] {
    return {
      id: blog.id,
      title: blog.title,
      image_url: blog.image_url,
      content: blog.content,
      author: {
        id: author.id,
        first_name: author.first_name,
        last_name: author.last_name,
        email: author.email,
        user_type: author.user_type,
        is_active: author.is_active,
        attempts_left: author.attempts_left,
        time_left: author.time_left,
        owned_organisations: author.owned_organisations,
        created_organisations: author.created_organisations,
        created_at: author.created_at,
        updated_at: author.updated_at,
      },
      comments: [],
      isPublished: blog.isPublished,
      category: {
        id: category.id,
        name: category.name,
      },
    };
  }
}
