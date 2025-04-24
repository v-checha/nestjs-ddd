# Entities

Entities are a core concept in Domain-Driven Design. They are objects with a unique identity that persists throughout the system's lifetime, even when their attributes change.

## Key Characteristics

- **Identity**: Entities have a unique identifier that distinguishes them from other objects.
- **Mutable**: Unlike value objects, entities can change over time while maintaining their identity.
- **Domain Logic**: Entities encapsulate business rules and domain logic related to their lifecycle.
- **Consistency**: Entities are responsible for maintaining their internal consistency through invariants.
- **Persistence**: Entities are typically persisted in a database.

## Implementation in This Project

In this project, entities are implemented as classes that extend a base `Entity` class. They use a property bag pattern where all attributes are stored in a `props` object.

### Base Entity Class

The `Entity` abstract class provides common functionality for all entities:

```typescript
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this._id = id ?? uuidv4();
    this.props = props;
  }

  public get id(): string {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }
}
```

### Example: Permission Entity

```typescript
interface PermissionProps {
  name: string;
  description: string;
  resource: Resource;
  action: PermissionAction;
  createdAt: Date;
  updatedAt: Date;
}

export class Permission extends Entity<PermissionProps> {
  private constructor(props: PermissionProps, id?: string) {
    super(props, id);
  }

  public static create(props: Partial<PermissionProps>, id?: string): Permission {
    // Ensure required properties are set
    if (!props.name) {
      throw new Error('Permission name is required');
    }
    if (!props.resource) {
      throw new Error('Permission resource is required');
    }
    if (!props.action) {
      throw new Error('Permission action is required');
    }

    // Create a new permission with default values for optional properties
    const permissionProps: PermissionProps = {
      name: props.name,
      description: props.description || '',
      resource: props.resource instanceof Resource ? props.resource : Resource.create(props.resource),
      action: props.action instanceof PermissionAction ? props.action : PermissionAction.create(props.action),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    return new Permission(permissionProps, id);
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get resource(): Resource {
    return this.props.resource;
  }

  public get action(): PermissionAction {
    return this.props.action;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: Partial<PermissionProps>): void {
    if (props.name) {
      this.props.name = props.name;
    }
    if (props.description !== undefined) {
      this.props.description = props.description;
    }
    if (props.resource) {
      this.props.resource = props.resource instanceof Resource 
        ? props.resource 
        : Resource.create(props.resource);
    }
    if (props.action) {
      this.props.action = props.action instanceof PermissionAction 
        ? props.action 
        : PermissionAction.create(props.action);
    }
    
    this.props.updatedAt = new Date();
  }
}
```

## Entities in This Project

The project implements several entities:

1. **Permission**: Represents a permission in the system
2. **Role**: Represents a user role with associated permissions
3. **User**: Represents a user in the system
4. **RefreshToken**: Represents a JWT refresh token
5. **VerificationToken**: Represents an email verification token

## Working with Entities

### Creating Entities

Entities are created using static factory methods to ensure proper initialization and validation:

```typescript
const permission = Permission.create({
  name: 'Create User',
  description: 'Allows creating new users',
  resource: Resource.create(ResourceType.USER),
  action: PermissionAction.create(ActionType.CREATE),
});
```

### Updating Entities

Entities provide methods to update their properties while maintaining invariants:

```typescript
permission.update({
  description: 'Updated description',
  resource: Resource.create(ResourceType.USER),
});
```

### Aggregates

Some entities form aggregates, where a root entity controls access to a group of related entities. For example, the `Role` entity controls access to its assigned `Permission` entities:

```typescript
// Role aggregate with permissions
role.addPermission(permission);
role.removePermission(permissionId);
role.hasPermission(resource, action);
```

## Benefits of Entities

1. **Business Logic Encapsulation**: Keep related behavior with the data it operates on
2. **Domain Integrity**: Ensure business rules are enforced consistently
3. **Identity Management**: Track objects across their lifecycle
4. **Rich Domain Model**: Create an expressive model that reflects the domain
5. **Change Tracking**: Manage and audit changes to important business objects

## Error Handling

Entities use domain-specific exceptions to signal invalid operations:

```typescript
throw new EntityNotFoundException('Permission', id);
```