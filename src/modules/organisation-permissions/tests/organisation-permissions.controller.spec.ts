import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationPermissionsController } from '../organisation-permissions.controller';
import { OrganisationPermissionsService } from '../organisation-permissions.service';

describe('OrganisationPermissionsController', () => {
  let controller: OrganisationPermissionsController;
  let service: OrganisationPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationPermissionsController],
      providers: [
        {
          provide: OrganisationPermissionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganisationPermissionsController>(OrganisationPermissionsController);
    service = module.get<OrganisationPermissionsService>(OrganisationPermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', () => {
      const createDto = { name: 'Test Permission' };
      controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', () => {
      controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', () => {
      const id = '1';
      controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call service.update', () => {
      const id = '1';
      const updateDto = { name: 'Updated Permission' };
      controller.update(id, updateDto);
      expect(service.update).toHaveBeenCalledWith(+id, updateDto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', () => {
      const id = '1';
      controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });
  });
});
