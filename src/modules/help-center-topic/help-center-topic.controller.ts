import { Controller, Get, Param } from '@nestjs/common';
import { helpCenterTopicErrorResponseDto, helpCenterTopicSuccessResponseDto } from './dto/help-center-topic.dto';
import { HelpCenterTopicService } from './help-center-topic.service';

@Controller('help-center/topics')
export class HelpCenterTopicController {
  constructor(private readonly helpCenterTopicService: HelpCenterTopicService) {}

  @Get('/search')
  getArticleByTitle(
    @Param('title') title: string
  ): Promise<helpCenterTopicSuccessResponseDto | helpCenterTopicErrorResponseDto> {
    return this.helpCenterTopicService.searchTitles(title);
  }
}
