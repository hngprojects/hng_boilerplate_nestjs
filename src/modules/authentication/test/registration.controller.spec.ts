import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import UserService from "../services/user.service";
import { AppModule } from "../../../app.module";
import * as request from 'supertest';
import { ERROR_OCCURED, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../../helpers/SystemMessages';
import { CreateUserDTO } from '../dto/create-user.dto';
import { INestApplication, HttpStatus } from '@nestjs/common';
import UserResponseDTO from "../dto/user-resonse.dto";



describe('RegistrationController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let jwtService: JwtService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(UserService)
            .useValue({
                getUserRecord: jest.fn(),
                createUser: jest.fn(),
            })
            .overrideProvider(JwtService)
            .useValue({
                sign: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        userService = moduleFixture.get<UserService>(UserService);
        jwtService = moduleFixture.get<JwtService>(JwtService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return BAD_REQUEST if user already exists', async () => {
        const body: CreateUserDTO = { email: 'test@example.com', first_name: 'John', last_name: 'Doe', password: 'password' };
        const existingRecord: UserResponseDTO = {
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            is_active: true,
            id: "some-uuid-value-here",
            attempts_left: 2,
            created_at: new Date(),
            updated_at: new Date(),
        }
        jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);

        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send(body)
            .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
            status_code: HttpStatus.BAD_REQUEST,
            message: USER_ACCOUNT_EXIST,
        });
    });


    it('should return CREATED and user data if registration is successful', async () => {
        const body: CreateUserDTO = { email: 'test@example.com', first_name: 'John', last_name: 'Doe', password: 'password' };
        const user: UserResponseDTO = {
            id: "1",
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name,
            attempts_left: 2,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const accessToken = 'fake-jwt-token';

        jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(null);
        jest.spyOn(userService, 'createUser').mockResolvedValueOnce(null);
        jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(user);
        jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send(body)
            .expect(HttpStatus.CREATED);
        user.created_at = response.body.data.user.created_at

        expect(response.body).toEqual({
            status_code: HttpStatus.CREATED,
            message: USER_CREATED_SUCCESSFULLY,
            data: {
                token: accessToken,
                user: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    created_at: user.created_at,
                },
            },
        });
    });

    it('should return INTERNAL_SERVER_ERROR on exception', async () => {
        const body: CreateUserDTO = { email: 'john@doe.com', first_name: 'John', last_name: 'Doe', password: 'password' };

        jest.spyOn(userService, 'getUserRecord').mockImplementationOnce(() => {
            throw new Error('Test error');
        });

        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send(body)
            .expect(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(response.body).toEqual({
            message: ERROR_OCCURED,
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
    });
});
