import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserDomainModule } from '../../domain/user/domain.module';
import { UserModule } from '../../frameworks/nest/modules/user.module';
import { AuthModule } from '../../infrastructure/authentication/auth.module';
import { ServicesModule } from '../../infrastructure/services/services.module';

// Mappers
import { UserMapper } from './mappers/user.mapper';
import { RoleMapper } from './mappers/role.mapper';
import { PermissionMapper } from './mappers/permission.mapper';

// User commands
import { CreateUserHandler } from './commands/create-user/create-user.handler';
import { UpdateUserHandler } from './commands/update-user/update-user.handler';

// Role commands
import { CreateRoleHandler } from './commands/create-role/create-role.handler';
import { UpdateRoleHandler } from './commands/update-role/update-role.handler';

// Permission commands
import { CreatePermissionHandler } from './commands/create-permission/create-permission.handler';
import { UpdatePermissionHandler } from './commands/update-permission/update-permission.handler';

// Role assignment commands
import { AssignRoleToUserHandler } from './commands/assign-role-to-user/assign-role-to-user.handler';
import { RemoveRoleFromUserHandler } from './commands/remove-role-from-user/remove-role-from-user.handler';

// Auth commands
import { LoginHandler } from './commands/login/login.handler';
import { RegisterHandler } from './commands/register/register.handler';
import { VerifyEmailHandler } from './commands/verify-email/verify-email.handler';
import { ForgotPasswordHandler } from './commands/forgot-password/forgot-password.handler';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { LogoutHandler } from './commands/logout/logout.handler';

// User queries
import { GetUserHandler } from './queries/get-user/get-user.handler';
import { ListUsersHandler } from './queries/list-users/list-users.handler';

// Role queries
import { GetRoleHandler } from './queries/get-role/get-role.handler';
import { ListRolesHandler } from './queries/list-roles/list-roles.handler';

// Permission queries
import { GetPermissionHandler } from './queries/get-permission/get-permission.handler';
import { ListPermissionsHandler } from './queries/list-permissions/list-permissions.handler';

const CommandHandlers = [
  // User commands
  CreateUserHandler,
  UpdateUserHandler,
  // Role commands
  CreateRoleHandler,
  UpdateRoleHandler,
  // Permission commands
  CreatePermissionHandler,
  UpdatePermissionHandler,
  // Role assignment commands
  AssignRoleToUserHandler,
  RemoveRoleFromUserHandler,
  // Auth commands
  LoginHandler,
  RegisterHandler,
  VerifyEmailHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  RefreshTokenHandler,
  LogoutHandler,
];

const QueryHandlers = [
  // User queries
  GetUserHandler,
  ListUsersHandler,
  // Role queries
  GetRoleHandler,
  ListRolesHandler,
  // Permission queries
  GetPermissionHandler,
  ListPermissionsHandler,
];

const Mappers = [UserMapper, RoleMapper, PermissionMapper];

@Module({
  imports: [CqrsModule, UserDomainModule, UserModule, AuthModule, ServicesModule],
  providers: [...Mappers, ...CommandHandlers, ...QueryHandlers],
  exports: [...Mappers, ...CommandHandlers, ...QueryHandlers],
})
export class UserApplicationModule {}
