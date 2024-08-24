import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApiStatusDto } from './dto/create-api-status.dto';
import { ApiHealth, ApiStatus } from './entities/api-status.entity';
import { Request } from './entities/request.entity';

@Injectable()
export class ApiStatusService {
  constructor(
    @InjectRepository(ApiHealth)
    private readonly apiHealthRepository: Repository<ApiHealth>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>
  ) {}

  async create(apiHealthDto: CreateApiStatusDto[]) {
    const apiHealthList = [];

    for (const eachApiStatus of apiHealthDto) {
      const apiHealth = await this.apiHealthRepository.findOne({
        where: { api_group: eachApiStatus.api_group },
      });

      if (!apiHealth) {
        const apiRequestList = [];
        const apiHealth = await this.apiHealthRepository.save(eachApiStatus);
        await Promise.all(
          eachApiStatus.requests.map(request => {
            this.requestRepository.save({
              ...request,
              api_health: apiHealth,
              updated_at: new Date(),
            });
            apiRequestList.push(request);
          })
        );

        const savedHealth = await this.apiHealthRepository.findOne({
          where: { id: apiHealth.id },
        });

        savedHealth.requests = apiRequestList;
        await this.apiHealthRepository.save(savedHealth);

        apiHealthList.push(apiHealth);
      } else {
        const apiRequestList = [];

        await this.requestRepository.clear();

        await Promise.all(
          eachApiStatus.requests.map(request => {
            this.requestRepository.save(request);
            apiRequestList.push(request);
          })
        );

        Object.assign(apiHealth, ApiStatus);
        apiHealth.requests = apiRequestList;
        apiHealth.updated_at = new Date();
        apiHealth.lastChecked = new Date();
        await this.apiHealthRepository.save(apiHealth);
        apiHealthList.push(apiHealth);
      }
    }

    return {
      message: `Status Added Successfully`,
      data: apiHealthList,
    };
  }

  async findAll() {
    const apiHealthData = await this.apiHealthRepository.find({
      relations: ['requests'],
    });

    return {
      message: `Health Status Retrieved Successfully`,
      data: apiHealthData,
    };
  }
}
