import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { CreateUserDto } from '../../TypeChecking/CreateUserDTO';
import UUIDGenerator from '../../../../Helpers/UUIDGenerator';
import UserService from '../../Services/user.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ERROR_OCCURED, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../../../Helpers/SystemMessages';

@Controller('/auth/register')
export default class RegistrationController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  @Post()
  public async handler(@Body() body: CreateUserDto, @Res() response: Response): Promise<any> {
    try {
      const identifier = UUIDGenerator.generate();
      const registrationPayload = { ...body, identifier };
      const userExists = await this.userService.getUserRecord({ identifier: registrationPayload.email, identifierType: "email" })
      if (userExists) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_EXIST
        })
      }

      await this.userService.createUser(registrationPayload);

      const user = await this.userService.getUserRecord({ identifier: registrationPayload.email, identifierType: "email" })
      const accessToken = this.jwtService.sign({
        email: registrationPayload.email,
        id: registrationPayload.identifier,
      });

      const responsePayload = {
        token: accessToken,
        user: {
          id: user.identifier,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          created_at: user.createdAt,
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
