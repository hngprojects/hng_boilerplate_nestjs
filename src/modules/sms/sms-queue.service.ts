import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { CreateSmsDto } from 'src/modules/sms/dto/create-sms.dto';

Injectable();
export default class SmsQueueService {
  constructor(
    @InjectQueue('sms')
    private readonly smsQueue: Queue
  ) {}
  async sendSms(createSmsDto: CreateSmsDto) {
    const smsJob = await this.smsQueue.add(createSmsDto);
    return { jobId: smsJob.id };
  }
}
