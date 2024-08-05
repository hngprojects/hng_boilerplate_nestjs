import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { TeamMemberResponseDto } from './dto/team.response.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>
  ) {}

  async createTeamMember(createTeamDto: CreateTeamDto): Promise<TeamMemberResponseDto> {
    try {
      const teamMember = this.teamRepository.create(createTeamDto);
      await this.teamRepository.save(teamMember);

      return this.mapTeamToResponseDto(teamMember);
    } catch (err) {
      throw new BadRequestException('Failed to create team member');
    }
  }

  async findAllTeamMembers(): Promise<TeamMemberResponseDto[]> {
    const teamMembers = await this.teamRepository.find();
    return teamMembers.map(this.mapTeamToResponseDto);
  }

  async findOneTeamMember(id: string): Promise<TeamMemberResponseDto> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return this.mapTeamToResponseDto(team);
  }

  async updateTeamMember(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamMemberResponseDto> {
    const team = await this.findOneTeamMember(id);
    Object.assign(team, updateTeamDto);
    try {
      const updatedTeam = await this.teamRepository.save(team);
      return this.mapTeamToResponseDto(updatedTeam);
    } catch (err) {
      throw new BadRequestException('Failed to update team member');
    }
  }

  async removeTeamMember(id: string): Promise<{ message: string; status: HttpStatus }> {
    const result = await this.teamRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return {
      message: 'The team member has been successfully deleted.',
      status: HttpStatus.OK,
    };
  }

  private mapTeamToResponseDto(team: Team): TeamMemberResponseDto {
    return {
      id: team.id,
      name: team.name,
      title: team.title,
      description: team.description,
      image: team.image,
      socials: {
        facebook: team.facebook,
        twitter: team.twitter,
        instagram: team.instagram,
      },
    };
  }
}
