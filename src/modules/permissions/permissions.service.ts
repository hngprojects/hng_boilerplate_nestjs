import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from './entities/permissions.entity';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { RESOURCE_NOT_FOUND } from '../../helpers/SystemMessages';
import UpdatePermissionOption from './dto/update-permission.dto';
import { title } from 'process';

@Injectable()
export class OrganisationPermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionRepository: Repository<Permissions>
  ) {}

  public async createPermission(title: string): Promise<Permissions> {
    const permission = new Permissions();
    permission.title = title;
    return await this.permissionRepository.save(permission);
  }

  public async getPermissions(): Promise<Permissions[]> {
    return await this.permissionRepository.find();
  }

  public async getAllPermissions() {
    const permissions = await this.getPermissions();
    return {
      status_code: HttpStatus.OK,
      message: 'Permissions fetched successfully',
      data: permissions,
    };
  }

  public async getSinglePermission(identifier: string) {
    const permission = await this.getPermissionById(identifier);
    if (!permission) {
      throw new CustomHttpException(RESOURCE_NOT_FOUND('Permission'), HttpStatus.NOT_FOUND);
    }

    return {
      status_code: HttpStatus.OK,
      message: 'Permission fetched successfully',
      data: permission,
    };
  }

  public async updatePermission(payload: UpdatePermissionOption) {
    const permission = await this.permissionRepository.findOne({ where: { id: payload.id } });

    if (!permission) {
      throw new CustomHttpException(RESOURCE_NOT_FOUND('Permission'), HttpStatus.NOT_FOUND);
    }
    permission.title = payload.permission.title;
    const updatedPermission = await this.permissionRepository.save(permission);
    return {
      status_code: HttpStatus.OK,
      message: 'Permission updated successfully',
      data: {
        id: updatedPermission.id,
        title: updatedPermission.title,
      },
    };
  }

  public async getPermissionById(id: string): Promise<Permissions> {
    return await this.permissionRepository.findOne({ where: { id } });
  }

  public async getPermissionByTitle(identifier: string): Promise<Permissions> {
    return await this.permissionRepository.findOne({ where: { title: identifier } });
  }
}
