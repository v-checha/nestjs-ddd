# Repository Pattern

The Repository pattern is a critical design pattern in Domain-Driven Design that mediates between the domain and data mapping layers. It provides an abstraction of data, so the domain model doesn't need to know about the underlying data access mechanisms.

## Purpose of Repositories

Repositories serve several key purposes:

1. **Abstraction**: Hide data access details from the domain model
2. **Decoupling**: Allow switching data sources without changing domain code
3. **Testability**: Enable easier testing by mocking or faking repositories
4. **Centralization**: Provide a central place for data access logic
5. **Encapsulation**: Encapsulate query logic and data mapping

## Implementation Structure

In this project, repositories follow a clean architecture approach:

1. **Repository Interfaces**: Defined in the domain layer
2. **Repository Implementations**: Implemented in the infrastructure layer
3. **Dependency Injection**: Injected into application services

### Repository Interface Example

```typescript
// Domain layer interface
export interface PermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: Resource): Promise<Permission[]>;
  findByAction(action: PermissionAction): Promise<Permission[]>;
  findByResourceAndAction(resource: Resource, action: PermissionAction): Promise<Permission | null>;
  findAll(page?: number, limit?: number): Promise<PaginatedResult<Permission>>;
  save(permission: Permission): Promise<void>;
  saveMany(permissions: Permission[]): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Repository Implementation Example

```typescript
// Infrastructure layer implementation using Prisma
@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  private readonly logger = new Logger(PrismaPermissionRepository.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    try {
      const permissionData = await this.prisma.permission.findUnique({
        where: { id },
      });

      if (!permissionData) return null;

      return this.mapToDomain(permissionData);
    } catch (error) {
      this.logger.error(`Error finding permission by ID: ${error.message}`);
      return null;
    }
  }

  async save(permission: Permission): Promise<void> {
    try {
      await this.prisma.permission.upsert({
        where: { id: permission.id },
        update: {
          name: permission.name,
          description: permission.description,
          resource: permission.resource.toString(),
          action: permission.action.toString(),
          updatedAt: new Date(),
        },
        create: {
          id: permission.id,
          name: permission.name,
          description: permission.description,
          resource: permission.resource.toString(),
          action: permission.action.toString(),
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving permission: ${error.message}`);
      throw new EntitySaveException('Permission', error.message);
    }
  }

  // Additional methods...

  private mapToDomain(permissionData: PrismaPermissionModel): Permission {
    return Permission.create({
      name: permissionData.name,
      description: permissionData.description,
      resource: Resource.create(permissionData.resource),
      action: PermissionAction.create(permissionData.action),
      createdAt: permissionData.createdAt,
      updatedAt: permissionData.updatedAt,
    }, permissionData.id);
  }
}
```

## Repository Registration

Repositories are registered using NestJS's dependency injection system:

```typescript
// Module registration
@Module({
  providers: [
    {
      provide: 'PermissionRepository',
      useClass: PrismaPermissionRepository,
    },
    // Other repositories...
  ],
  exports: ['PermissionRepository'],
})
export class RepositoriesModule {}
```

## Repositories in This Project

The project implements several repositories:

1. **PermissionRepository**: Manages Permission entities
2. **RoleRepository**: Manages Role entities
3. **UserRepository**: Manages User entities
4. **RefreshTokenRepository**: Manages RefreshToken entities
5. **VerificationTokenRepository**: Manages VerificationToken entities

## Value Object Handling

When working with repositories, special care is taken to handle value objects:

1. **Persistence**: Value objects are converted to primitive types (usually strings) for storage
2. **Retrieval**: Primitive values are reconstructed into value objects when loading entities
3. **Querying**: Value objects are converted to primitives for database queries

Example:

```typescript
// Converting a value object to a primitive for database storage
resource: permission.resource.toString(),

// Converting a primitive to a value object when loading an entity
resource: Resource.create(permissionData.resource),
```

## Repository Query Methods

Repositories typically provide several query methods:

1. **findById**: Find an entity by its identifier
2. **findByX**: Find entities by a specific attribute
3. **findAll**: Get all entities, potentially with pagination
4. **customQueries**: Domain-specific query methods (e.g., findByResourceAndAction)

## Pagination

For methods that can return many entities, pagination is implemented:

```typescript
async findAll(page = 1, limit = 10): Promise<PaginatedResult<Permission>> {
  try {
    const skip = (page - 1) * limit;
    const total = await this.prisma.permission.count();
    const totalPages = Math.ceil(total / limit);
    
    const permissions = await this.prisma.permission.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    return {
      data: permissions.map((permission) => this.mapToDomain(permission)),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    // Error handling...
  }
}
```

## Error Handling

Repositories use custom domain exceptions to signal errors:

```typescript
throw new EntitySaveException('Permission', error.message);
throw new EntityDeleteException('Permission', error.message);
```

## Testing Repositories

For testing, repositories can be mocked or implemented with in-memory data:

```typescript
// Example of a mock repository for testing
export class MockPermissionRepository implements PermissionRepository {
  private permissions: Map<string, Permission> = new Map();

  async findById(id: string): Promise<Permission | null> {
    return this.permissions.get(id) || null;
  }

  async save(permission: Permission): Promise<void> {
    this.permissions.set(permission.id, permission);
  }

  // Implement other methods...
}
```