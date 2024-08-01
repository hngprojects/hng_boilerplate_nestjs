import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WaitlistPage } from './entities/waitlist-page.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWaitlistPageDTO } from './dto/create-waitlist-page.dto';
import { CreateWaitlistPageResponseDTO } from './dto/create-waitlist-page-response.dto';

@Injectable()
export default class WaitlistPageService {
  constructor(@InjectRepository(WaitlistPage) private readonly waitlistPageRepository: Repository<WaitlistPage>) {}

  async createWaitlistPage(createWaitlistPageDTO: CreateWaitlistPageDTO): Promise<CreateWaitlistPageResponseDTO> {
    try {
      const newWaitlistPage = this.waitlistPageRepository.create(createWaitlistPageDTO);
      const savedWaitlistPage = await this.waitlistPageRepository.save(newWaitlistPage);

      return {
        status: 'Success',
        status_code: HttpStatus.CREATED,
        message: 'Waitlist page created successfully',
        data: {
          waitlist: savedWaitlistPage,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException({ message: 'Internal Server Error' });
    }
  }

  async getAllWaitlistPages(page: number = 1, limit: number = 10) {
    const [waitlist_pages, total] = await this.waitlistPageRepository.findAndCount({
      select: ['id', 'page_title', 'url_slug', 'status', 'created_at'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_users: total,
    };

    const formattedUsers = waitlist_pages.map(waitlist_page => ({
      id: waitlist_page.id,
      page_title: waitlist_page.page_title,
      url_slug: waitlist_page.url_slug,
      status: waitlist_page.status,
      created_at: waitlist_page.created_at,
    }));

    const waitlistPages = await this.waitlistPageRepository.find();
    return {
      status_code: HttpStatus.OK,
      status: 'Success',
      message: 'Waitlist pages retrieved successfully',
      data: {
        waitlistPages,
      },
    };
  }
}
