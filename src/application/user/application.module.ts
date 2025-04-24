import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserDomainModule } from '../../domain/user/domain.module';
import { UserMapper } from './mappers/user.mapper';
import { CreateUserHandler } from './commands/create-user/create-user.handler';
import { UpdateUserHandler } from './commands/update-user/update-user.handler';
import { GetUserHandler } from './queries/get-user/get-user.handler';
import { ListUsersHandler } from './queries/list-users/list-users.handler';
import { UserModule } from '../../frameworks/nest/modules/user.module';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler];
const QueryHandlers = [GetUserHandler, ListUsersHandler];

@Module({
  imports: [CqrsModule, UserDomainModule, UserModule],
  providers: [UserMapper, ...CommandHandlers, ...QueryHandlers],
  exports: [UserMapper, ...CommandHandlers, ...QueryHandlers],
})
export class UserApplicationModule {}