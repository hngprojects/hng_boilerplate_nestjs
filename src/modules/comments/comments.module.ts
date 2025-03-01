import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comments.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';
//

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Organisation, OrganisationUserRole, Role]), UserModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
