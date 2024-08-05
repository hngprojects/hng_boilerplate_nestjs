export class BlogResponseDto {
  blog_id: string;
  title: string;
  content: string;
  tags?: string[];
  image_urls?: string[];
  author: string;
  created_at: Date;
}
