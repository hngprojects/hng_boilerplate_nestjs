import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Role } from '@modules/role/entities/role.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, User, Organisation, OrganisationUserRole, Role])],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
