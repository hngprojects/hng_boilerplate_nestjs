import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetAllSubscriptionsResponseDto } from './dto/get-all-subscription-response.dto';
import { SubscriptionsService } from './subscriptions.service';
import { NotificationSettingsErrorDto } from '@modules/notification-settings/dto/notification-settings-error.dto';

@ApiBearerAuth()
@Controller('subscriptions')
@ApiTags('Dashboard')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOkResponse({
    description: 'Fetch all active subscription count',
    type: GetAllSubscriptionsResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: NotificationSettingsErrorDto,
  })
  getAllSubscriptions(): Promise<GetAllSubscriptionsResponseDto> {
    return this.subscriptionsService.getAllSubscriptions();
  }
}
