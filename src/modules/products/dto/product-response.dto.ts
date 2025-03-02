import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  averageRating: number;
  totalReviews: number;

  @ApiProperty({ type: () => [ReviewSummaryDto] })
  recentReviews: ReviewSummaryDto[];
}

// Define ReviewSummaryDto **inside the same file**, avoiding unnecessary imports
class ReviewSummaryDto {
  rating: number;
  review: string;
  createdBy: string;
  createdAt: Date;
}
