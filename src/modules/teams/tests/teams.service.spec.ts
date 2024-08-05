import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../teams.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Team } from '../entities/team.entity';
import { Repository } from 'typeorm';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamMemberResponseDto } from '../dto/team.response.dto';

describe('TeamsService', () => {
  let service: TeamsService;
  let repo: Repository<Team>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    repo = module.get<Repository<Team>>(getRepositoryToken(Team));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTeamMember', () => {
    it('should successfully create a team member', async () => {
      const createTeamDto: CreateTeamDto = {
        name: 'John Doe',
        title: 'Developer',
        description: 'Experienced developer',
        image: 'john.jpg',
        facebook: 'john.doe',
        twitter: 'johnd',
        instagram: 'johndoe',
      };
      const team = { id: '1', ...createTeamDto, created_at: new Date(), updated_at: new Date() };
      const teamResponseDto: TeamMemberResponseDto = {
        id: '1',
        name: 'John Doe',
        title: 'Developer',
        description: 'Experienced developer',
        image: 'john.jpg',
        socials: { facebook: 'john.doe', twitter: 'johnd', instagram: 'johndoe' },
      };

      jest.spyOn(repo, 'create').mockReturnValue(team as unknown as Team);
      jest.spyOn(repo, 'save').mockResolvedValue(team as unknown as Team);

      expect(await service.createTeamMember(createTeamDto)).toEqual(teamResponseDto);
      expect(repo.create).toHaveBeenCalledWith(createTeamDto);
      expect(repo.save).toHaveBeenCalledWith(team);
    });
  });

  describe('findAllTeamMembers', () => {
    it('should return an array of team members', async () => {
      const teams = [
        {
          id: '1',
          name: 'John Doe',
          title: '',
          description: '',
          image: '',
          facebook: '',
          twitter: '',
          instagram: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          title: '',
          description: '',
          image: '',
          facebook: '',
          twitter: '',
          instagram: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      const teamResponseDtos: TeamMemberResponseDto[] = [
        {
          id: '1',
          name: 'John Doe',
          title: '',
          description: '',
          image: '',
          socials: { facebook: '', twitter: '', instagram: '' },
        },
        {
          id: '2',
          name: 'Jane Doe',
          title: '',
          description: '',
          image: '',
          socials: { facebook: '', twitter: '', instagram: '' },
        },
      ];
      jest.spyOn(repo, 'find').mockResolvedValue(teams as Team[]);

      expect(await service.findAllTeamMembers()).toEqual(teamResponseDtos);
    });
  });

  describe('findOneTeamMember', () => {
    it('should return a team member if found', async () => {
      const team = {
        id: '1',
        name: 'John Doe',
        title: '',
        description: '',
        image: '',
        facebook: '',
        twitter: '',
        instagram: '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const teamResponseDto: TeamMemberResponseDto = {
        id: '1',
        name: 'John Doe',
        title: '',
        description: '',
        image: '',
        socials: { facebook: '', twitter: '', instagram: '' },
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(team as Team);

      expect(await service.findOneTeamMember('1')).toEqual(teamResponseDto);
    });

    it('should throw NotFoundException if team member is not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOneTeamMember('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTeamMember', () => {
    it('should update a team member', async () => {
      const team = {
        id: '1',
        name: 'John Doe',
        title: 'Developer',
        description: '',
        image: '',
        facebook: '',
        twitter: '',
        instagram: '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updateTeamDto: UpdateTeamDto = { name: 'Jane Doe' };
      const updatedTeam = { ...team, ...updateTeamDto };
      const teamResponseDto: TeamMemberResponseDto = {
        id: '1',
        name: 'Jane Doe',
        title: 'Developer',
        description: '',
        image: '',
        socials: { facebook: '', twitter: '', instagram: '' },
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(team as Team);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedTeam as Team);

      expect(await service.updateTeamMember('1', updateTeamDto)).toEqual(teamResponseDto);
    });

    it('should throw NotFoundException if team member is not found', async () => {
      const updateTeamDto: UpdateTeamDto = { name: 'Jane Doe' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.updateTeamMember('1', updateTeamDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeTeamMember', () => {
    it('should remove a team member', async () => {
      const team = {
        id: '1',
        name: 'John Doe',
        title: 'Developer',
        description: '',
        image: '',
        facebook: '',
        twitter: '',
        instagram: '',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(team as Team);
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.removeTeamMember('1');
      expect(result).toEqual({ message: 'The team member has been successfully deleted.', status: HttpStatus.OK });
    });

    it('should throw NotFoundException if team member is not found', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.removeTeamMember('1')).rejects.toThrow(NotFoundException);
    });
  });
});
