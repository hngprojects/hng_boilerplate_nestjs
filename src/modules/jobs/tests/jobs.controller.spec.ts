import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from '../jobs.controller';
import { BadRequestException, INestApplication, UseGuards, ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import { JobsService } from '../jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';
import { User } from '../../user/entities/user.entity';
import { SuperAdminGuard } from '../../../guards/super-admin.guard';
import { plainToInstance } from 'class-transformer';
import { JobIdDto } from '../dto/delete-job.dto';
import { validate } from 'class-validator';

describe('JobsController', () => {
  it('should throw a BadRequestException if the id is not a valid UUID', async () => {
    const dto = { id: 'xd' };
    const invalidDtoObject = plainToInstance(JobIdDto, dto);
    const errors = await validate(invalidDtoObject);
    expect(errors[0].constraints.isUuid).toEqual('id must be a UUID');
  });
});
