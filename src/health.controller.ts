import { Controller, Get } from '@nestjs/common';

@Controller()
export default class HealthController {
    @Get("/")
    public home() {
        return { status_code: 200, message: "Welcome to our NestJs Backend Endpoint" };
    }
    @Get("health")
    public health() {
        return 'healthy endpoint';
    }
}
