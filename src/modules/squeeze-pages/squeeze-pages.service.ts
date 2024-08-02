import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSqueezePageDto } from './dto/create-squeeze-pages.dto';
import { UpdateSqueezePageDto } from './dto/update-squeeze-pages.dto';
import { SqueezePage } from './entities/squeeze-pages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class SqueezePagesService {
  constructor(
    @InjectRepository(SqueezePage)
    private readonly squeezePagesRepository: Repository<SqueezePage>
  ) {}

  async create(createSqueezePagesDto: CreateSqueezePageDto) {
    try {
      const squeezePage = new SqueezePage();
      Object.assign(squeezePage, createSqueezePagesDto);
      await this.squeezePagesRepository.save(squeezePage);
      return {
        status: 'success',
        status_code: 201,
        message: 'Squeeze Page created successfully.',
        data: {
          squeeze_page: squeezePage,
        },
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          throw new ConflictException('Squeeze Page with this title already exists');
        }
      }

      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findUriSlugs() {
    const squeezePagesSlug = await this.squeezePagesRepository.find({ select: ['url_slug'] });

    const squeezePagesSlugUrl = squeezePagesSlug.map(squeezePage => squeezePage.url_slug);
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Pages retrieved successfully.',
      data: {
        squeeze_pages_slug_uri: squeezePagesSlugUrl,
      },
    };
  }

  async findAll() {
    const [squeezePages, total] = await this.squeezePagesRepository.findAndCount();
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Pages retrieved successfully.',
      data: {
        squeeze_pages: squeezePages,
        total,
      },
    };
  }

  async findPaginated(pageNumber: number, limit: number) {
    const skip = (pageNumber - 1) * limit;
    const [squeezePages, total] = await this.squeezePagesRepository.findAndCount({
      skip,
      take: limit,
    });
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Pages retrieved successfully.',
      data: {
        squeeze_pages: squeezePages,
        total,
      },
    };
  }

  async findByTitle(title: string) {
    const [squeezePage, total] = await this.squeezePagesRepository.findAndCount({ where: { page_title: title } });
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Pages retrieved successfully.',
      data: {
        squeeze_page: squeezePage,
        total,
      },
    };
  }

  async update(id: string, updateSqueezePagesDto: UpdateSqueezePageDto) {
    const squeezePage = await this.squeezePagesRepository.findOne({ where: { id } });
    if (!squeezePage) {
      throw new NotFoundException('Squeeze Page not found');
    }
    Object.assign(squeezePage, updateSqueezePagesDto);
    await this.squeezePagesRepository.save(squeezePage);
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Page updated successfully.',
      data: {
        squeeze_page: squeezePage,
      },
    };
  }

  async remove(id: string) {
    const squeezePage = await this.squeezePagesRepository.findOne({ where: { id } });
    if (!squeezePage) {
      throw new NotFoundException('Squeeze Page not found');
    }
    await this.squeezePagesRepository.remove(squeezePage);
    return {
      status: 'success',
      status_code: 200,
      message: 'Squeeze Page removed successfully.',
    };
  }
}
