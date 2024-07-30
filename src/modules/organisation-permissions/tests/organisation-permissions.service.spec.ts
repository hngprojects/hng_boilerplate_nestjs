import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationPermissionsService } from '../organisation-permissions.service';

describe('OrganisationPermissionsService', () => {
  let service: OrganisationPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganisationPermissionsService],
    }).compile();

    service = module.get<OrganisationPermissionsService>(OrganisationPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a string', () => {
      const result = service.create({} as any);
      expect(typeof result).toBe('string');
    });
  });

  describe('findAll', () => {
    it('should return a string', () => {
      const result = service.findAll();
      expect(typeof result).toBe('string');
    });
  });

  describe('findOne', () => {
    it('should return a string', () => {
      const result = service.findOne(1);
      expect(typeof result).toBe('string');
    });
  });

  describe('update', () => {
    it('should return a string', () => {
      const result = service.update(1, {} as any);
      expect(typeof result).toBe('string');
    });
  });

  describe('remove', () => {
    it('should return a string', () => {
      const result = service.remove(1);
      expect(typeof result).toBe('string');
    });
  });
});
