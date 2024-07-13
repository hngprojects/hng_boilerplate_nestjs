import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import logger from 'moment-logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    logger.log('connecting to the database.....');
    await this.$connect();
    logger.info('Connected to the database');
  }
}
