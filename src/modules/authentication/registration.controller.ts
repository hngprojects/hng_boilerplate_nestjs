import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from './dto/create-user.dto';
import { FAILED_TO_CREATE_USER, ERROR_OCCURED, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../helpers/SystemMessages';
import { skipAuth } from '../../helpers/skipAuth';
import UserService from './user.service';

@Controller('api/v1/auth/register')
export default class RegistrationController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  @skipAuth()
  @Post()
  public async handler(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    try {
      const registrationPayload = body
      const userExists = await this.userService.getUserRecord({ identifier: registrationPayload.email, identifierType: "email" })

      if (userExists) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_EXIST
        })
      }

      await this.userService.createUser(registrationPayload);

      const user = await this.userService.getUserRecord({ identifier: registrationPayload.email, identifierType: "email" })

      if (!user) {
        return response.status(HttpStatus.CREATED).send({
          status_code: HttpStatus.BAD_REQUEST,
          message: FAILED_TO_CREATE_USER,
        });
      }

      const accessToken = this.jwtService.sign({
        email: registrationPayload.email,
        first_name: registrationPayload.first_name,
        last_name: registrationPayload,
        sub: user.id
      });

      const responsePayload = {
        token: accessToken,
        user: {

          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: user.created_at,
        },
      };

      return response.status(HttpStatus.CREATED).send({
        status_code: HttpStatus.CREATED,
        message: USER_CREATED_SUCCESSFULLY,
        data: responsePayload,
      });
    } catch (RegistrationControllerError) {
      console.log('RegistrationControllerError ~ Error ~', RegistrationControllerError);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: ERROR_OCCURED,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
