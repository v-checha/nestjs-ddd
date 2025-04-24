# CQRS Pattern

Command Query Responsibility Segregation (CQRS) is a pattern that separates read and write operations for a data store. In this project, CQRS is implemented using NestJS's CQRS module.

## Overview

CQRS separates operations that read data (Queries) from operations that write data (Commands):

- **Commands**: Operations that change state and typically don't return values
- **Queries**: Operations that return data and don't change state

## Benefits of CQRS

1. **Separation of concerns**: Read and write operations have different requirements
2. **Scalability**: Read and write sides can be scaled independently
3. **Performance optimization**: Read models can be optimized for queries
4. **Security**: Fine-grained control over who can query vs. command
5. **Evolution**: Different parts of the system can evolve independently

## Implementation in This Project

The CQRS pattern is implemented using NestJS's CQRS module:

```typescript
// Module setup
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    // Other modules...
  ],
  // ...
})
export class UserModule {}
```

### Commands

Commands represent intentions to change the state of the system. They are implemented as simple classes with properties.

#### Command Definition

```typescript
export class CreatePermissionCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly resource: string | Resource,
    public readonly action: string | PermissionAction,
  ) {}
}
```

#### Command Handler

Command handlers process commands and perform the actual work:

```typescript
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler
  implements ICommandHandler<CreatePermissionCommand, PermissionDto>
{
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(command: CreatePermissionCommand): Promise<PermissionDto> {
    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findByName(command.name);
    if (existingPermission) {
      throw new InvalidPermissionException(`Permission with name ${command.name} already exists`);
    }

    // Convert strings to value objects if needed
    const resource = command.resource instanceof Resource 
      ? command.resource 
      : Resource.create(command.resource);
      
    const action = command.action instanceof PermissionAction 
      ? command.action 
      : PermissionAction.create(command.action);

    // Create a new permission
    const permission = Permission.create({
      name: command.name,
      description: command.description,
      resource: resource,
      action: action,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the permission
    await this.permissionRepository.save(permission);

    // Return the DTO
    return this.permissionMapper.toDto(permission);
  }
}
```

### Queries

Queries represent requests for data. Like commands, they are implemented as simple classes.

#### Query Definition

```typescript
export class GetPermissionQuery {
  constructor(public readonly id: string) {}
}
```

#### Query Handler

Query handlers process queries and return data:

```typescript
@QueryHandler(GetPermissionQuery)
export class GetPermissionHandler implements IQueryHandler<GetPermissionQuery, PermissionDto> {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(query: GetPermissionQuery): Promise<PermissionDto> {
    const permission = await this.permissionRepository.findById(query.id);

    if (!permission) {
      throw new EntityNotFoundException('Permission', query.id);
    }

    return this.permissionMapper.toDto(permission);
  }
}
```

### Executing Commands and Queries

Commands and queries are executed using the CommandBus and QueryBus:

```typescript
@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createPermission(@Body() request: CreatePermissionRequest): Promise<ApiResponse<PermissionResponse>> {
    const command = new CreatePermissionCommand(
      request.name,
      request.description,
      request.resource,
      request.action,
    );

    const result = await this.commandBus.execute(command);
    return ApiResponse.success(result);
  }

  @Get(':id')
  async getPermission(@Param('id') id: string): Promise<ApiResponse<PermissionResponse>> {
    const result = await this.queryBus.execute(new GetPermissionQuery(id));
    return ApiResponse.success(result);
  }
}
```

## Commands and Queries in This Project

### Commands

1. **User Commands**:
   - `CreateUserCommand`: Creates a new user
   - `UpdateUserCommand`: Updates user information
   - `DeleteUserCommand`: Deletes a user
   - `ChangePasswordCommand`: Changes a user's password

2. **Role Commands**:
   - `CreateRoleCommand`: Creates a new role
   - `UpdateRoleCommand`: Updates role information
   - `DeleteRoleCommand`: Deletes a role
   - `AssignRoleToUserCommand`: Assigns a role to a user
   - `RemoveRoleFromUserCommand`: Removes a role from a user

3. **Permission Commands**:
   - `CreatePermissionCommand`: Creates a new permission
   - `UpdatePermissionCommand`: Updates permission information
   - `DeletePermissionCommand`: Deletes a permission

4. **Authentication Commands**:
   - `LoginCommand`: Authenticates a user
   - `LogoutCommand`: Logs out a user
   - `RefreshTokenCommand`: Refreshes an authentication token
   - `RegisterCommand`: Registers a new user

### Queries

1. **User Queries**:
   - `GetUserQuery`: Gets a user by ID
   - `ListUsersQuery`: Lists users with pagination
   - `GetUserByEmailQuery`: Gets a user by email

2. **Role Queries**:
   - `GetRoleQuery`: Gets a role by ID
   - `ListRolesQuery`: Lists roles with pagination

3. **Permission Queries**:
   - `GetPermissionQuery`: Gets a permission by ID
   - `ListPermissionsQuery`: Lists permissions with pagination

## DTOs and Mappers

DTOs (Data Transfer Objects) are used to transfer data between layers. Mappers transform entities to DTOs and vice versa.

### DTO Example

```typescript
export class PermissionDto {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mapper Example

```typescript
@Injectable()
export class PermissionMapper {
  toDto(permission: Permission): PermissionDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource.toString(),
      action: permission.action.toString(),
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }

  toDtoList(permissions: Permission[]): PermissionDto[] {
    return permissions.map(permission => this.toDto(permission));
  }
}
```

## Error Handling

Command and query handlers use domain exceptions for error handling:

```typescript
if (!permission) {
  throw new EntityNotFoundException('Permission', query.id);
}
```

These exceptions are caught by an exception filter and transformed into appropriate HTTP responses.

## Transaction Management

For operations that need to maintain data consistency, transactions can be used:

```typescript
// Using Prisma transactions
await this.prisma.$transaction(async (prisma) => {
  // Multiple database operations in a transaction
});
```

## Testing Command and Query Handlers

Command and query handlers can be tested in isolation by mocking dependencies:

```typescript
describe('CreatePermissionHandler', () => {
  let handler: CreatePermissionHandler;
  let mockRepository: MockPermissionRepository;
  let mockMapper: PermissionMapper;

  beforeEach(() => {
    mockRepository = new MockPermissionRepository();
    mockMapper = new PermissionMapper();
    handler = new CreatePermissionHandler(mockRepository, mockMapper);
  });

  it('should create a permission', async () => {
    // Test implementation
  });
});
```