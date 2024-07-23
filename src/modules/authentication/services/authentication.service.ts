import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../dto/create-user.dto';
import { ERROR_OCCURED, FAILED_TO_CREATE_USER, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/services/user.service';

@Injectable()
export default class AuthenticationService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async createNewUser(creatUserDto: CreateUserDTO) {
        try {
            const userExists = await this.userService.getUserRecord({ identifier: creatUserDto.email, identifierType: "email" })

            if (userExists) {
                return {
                    status_code: HttpStatus.BAD_REQUEST,
                    message: USER_ACCOUNT_EXIST
                }
            }

            await this.userService.createUser(creatUserDto);

            const user = await this.userService.getUserRecord({ identifier: creatUserDto.email, identifierType: "email" })

            if (!user) {
                return {
                    status_code: HttpStatus.BAD_REQUEST,
                    message: FAILED_TO_CREATE_USER,
                }
            }

            const accessToken = this.jwtService.sign({
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
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

            return {
                status_code: HttpStatus.CREATED,
                message: USER_CREATED_SUCCESSFULLY,
                data: responsePayload,
            }

        } catch (createNewUserError) {
            console.log('AuthenticationServiceError ~ createNewUserError ~', createNewUserError);
            return {
                message: ERROR_OCCURED,
                status_code: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

}
