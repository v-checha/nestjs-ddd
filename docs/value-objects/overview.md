# Value Objects

Value Objects are a fundamental concept in Domain-Driven Design. They are immutable objects that describe characteristics of a domain but have no identity.

## Key Characteristics

- **Immutability**: Value objects are immutable; once created, they cannot be changed.
- **Value Equality**: Two value objects with the same properties are considered equal.
- **Self-Validation**: Value objects validate their own state to ensure they always remain valid.
- **No Identity**: Value objects don't have an identity; they are defined by their attributes.
- **Domain Logic Encapsulation**: Value objects encapsulate domain rules and behavior related to their values.

## Implementation in This Project

In this project, value objects are implemented as classes with private constructors and static factory methods to enforce immutability and validation. They extend a base `ValueObject` class.

### Base Value Object Class

The `ValueObject` abstract class provides common functionality for all value objects:

```typescript
export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(valueObject?: ValueObject<T>): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false;
    }
    if (valueObject.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
  }
}
```

### Example: Resource Value Object

```typescript
export enum ResourceType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  // ...other resource types
}

interface ResourceProps {
  value: ResourceType;
}

export class Resource extends ValueObject<ResourceProps> {
  private constructor(props: ResourceProps) {
    super(props);
  }

  public get value(): ResourceType {
    return this.props.value;
  }

  public static create(resource: ResourceType | string): Resource {
    if (!Object.values(ResourceType).includes(resource as ResourceType)) {
      throw new InvalidValueObjectException('Resource', resource, 'Resource type not recognized');
    }

    return new Resource({ value: resource as ResourceType });
  }

  public toString(): string {
    return this.props.value;
  }

  public static isValid(resource: string): boolean {
    return Object.values(ResourceType).includes(resource as ResourceType);
  }

  public static getAll(): ResourceType[] {
    return Object.values(ResourceType);
  }
}
```

## Value Objects in This Project

The project implements several value objects:

1. **Resource**: Represents a type of resource in the system (User, Role, Permission, etc.)
2. **PermissionAction**: Represents an action that can be performed on a resource (Create, Read, Update, Delete, Manage)
3. **RoleType**: Represents a type of role (SuperAdmin, Admin, Moderator, User, Guest)
4. **PermissionName**: Represents a permission name with validation rules
5. **RoleName**: Represents a role name with validation rules
6. **Email**: Represents an email address with validation
7. **UserId**: Represents a user identifier
8. **RoleId**: Represents a role identifier
9. **PermissionId**: Represents a permission identifier

## Benefits of Value Objects

1. **Domain Logic Encapsulation**: Keep all related validation and behavior together
2. **Type Safety**: Provide compile-time safety for domain concepts
3. **Self-Validation**: Ensure objects are always in a valid state
4. **Immutability**: Prevent bugs due to unexpected state changes
5. **Expressiveness**: Make the domain model more expressive and easier to understand

## Creating New Value Objects

To create a new value object:

1. Define a properties interface for the value object
2. Create a class extending `ValueObject<PropertiesInterface>`
3. Implement a private constructor to enforce creation through factory methods
4. Implement a static `create()` method with appropriate validation
5. Add any domain-specific behavior as methods
6. Include a `toString()` method for string representation

## Error Handling

Value objects use custom domain exceptions when validation fails:

```typescript
throw new InvalidValueObjectException('ValueObjectName', value, 'Specific reason for failure');
```