import { Body, Controller, HttpCode, Put } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';

@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly squeezeService: SqueezeService) {}

  @Put()
  @HttpCode(200)
  async update(@Body() updateDto: UpdateSqueezeDto) {
    const updatedSqueeze = await this.squeezeService.updateSqueeze(updateDto);
    return {
      message: 'Your record has been successfully updated. You cannot update it again.',
      status_code: 200,
      data: {
        ...updatedSqueeze,
      },
    };
  }
}
