import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepository: Repository<Newsletter>
  ) {}

  async newsletterSubcription(createNewsletterDto: CreateNewsletterDto) {
    const { email } = createNewsletterDto;

    const existingSubscription = await this.newsletterRepository.findOne({ where: { email: email } });
    if (existingSubscription) {
      return { message: 'Subscriber subscription successful' };
    }
    const newSubscription = this.newsletterRepository.create({ ...createNewsletterDto });
    await this.newsletterRepository.save(newSubscription);
    const response = { status: 'success', message: 'Subscriber subscription successful' };
    return response;
  }

  @UseGuards(SuperAdminGuard)
  async findAll() {
    const subscribers = await this.newsletterRepository.find();

    return subscribers.map(newsletter => ({
      id: newsletter.id,
      email: newsletter.email,
    }));
  }

  @UseGuards(SuperAdminGuard)
  async remove(id: string) {
    const newsletter = await this.newsletterRepository.findOne({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }
    await this.newsletterRepository.softDelete(id);
    return { message: `Subscriber with ID ${id} has been soft deleted` };
  }

  @UseGuards(SuperAdminGuard)
  async findSoftDeleted() {
    return await this.newsletterRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }

  @UseGuards(SuperAdminGuard)
  async restore(id: string) {
    const result = await this.newsletterRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subscriber with ID ${id} not found or already restored`);
    }
    return { message: `Subscriber with ID ${id} has been restored` };
  }
}
