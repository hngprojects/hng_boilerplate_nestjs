import { Controller, Delete, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import { HelpCenterService } from './help-center.service';
import { CustomUUIDPipe } from '../../utils/customUUIDPipe';

@Controller('help-center/topic')
export class HelpCenterController {
  constructor(private readonly helpCenterTopicService: HelpCenterService) {}
  @Delete(':id')
  async deleteTopic(@Param('id', CustomUUIDPipe) id: string) {
    console.log(id);
    await this.helpCenterTopicService.deleteTopic(id);

    return { success: true, message: 'Topic delete successfully', status_code: HttpStatus.OK };
  }
}
