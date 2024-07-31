import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqService } from '../faq.service';
import { Faq } from '../entities/faq.entity';
import { BadRequestException } from '@nestjs/common';

describe('FaqService', () => {
  let service: FaqService;
  let repository: Repository<Faq>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: getRepositoryToken(Faq),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
    repository = module.get<Repository<Faq>>(getRepositoryToken(Faq));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of FAQs', async () => {
      const mockFaqs = [
        { id: '1', question: 'Q1', answer: 'A1', category: 'C1' },
        { id: '2', question: 'Q2', answer: 'A2', category: 'C2' },
      ];
      mockRepository.find.mockResolvedValue(mockFaqs);

      const result = await service.findAllFaq();

      expect(result).toEqual({
      
        data: mockFaqs
      ,
      message: "Faq fetched successfully",
      status_code: 200
    });
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return a FAQ', async () => {
      const id = '1';
      const updateFaqDto = { question: 'Updated Q', answer: 'Updated A', category: 'Updated C' };
      const existingFaq = { id, question: 'Q', answer: 'A', category: 'C' };
      const updatedFaq = { ...existingFaq, ...updateFaqDto };

      mockRepository.findOne.mockResolvedValue(existingFaq);
      mockRepository.save.mockResolvedValue(updatedFaq);

      const result = await service.updateFaq(id, updateFaqDto);

      expect(result).toEqual(updatedFaq);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedFaq);
    });

    it('should throw BadRequestException if FAQ not found', async () => {
      const id = '1';
      const updateFaqDto = { question: 'Updated Q' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateFaq(id, updateFaqDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('remove', () => {
    it('should remove a FAQ and return success message', async () => {
      const id = '1';
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeFaq(id);

      expect(result).toEqual({ message: 'FAQ successfully deleted' });
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw BadRequestException if FAQ not found', async () => {
      const id = '1';
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.removeFaq(id)).rejects.toThrow(BadRequestException);
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
