import { Controller, Get } from '@nestjs/common';

@Controller('health')
export default class HealthController {
    @Get()
    public health() {
        return 'healthy endpoint';
    }
}