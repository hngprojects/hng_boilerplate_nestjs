import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('api/v1/user')
export class UserController {

    @Get(':id')
    async getUserDetails(@Param('id')userId: string) {
       return this.UserService.getDetails(userId)
    }
}
