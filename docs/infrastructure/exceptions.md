# Exception Handling

This document describes the exception handling strategy in the application.

## Exception Hierarchy

The application implements a hierarchy of exceptions to provide consistent error handling:

```
Error
└── DomainException
    ├── EntitySaveException
    ├── EntityDeleteException
    ├── EntityNotFoundException
    ├── InvalidValueObjectException
    ├── InvalidPermissionException
    ├── InvalidRoleException
    └── RepositoryException
```

## Domain Exceptions

Domain exceptions are defined in the domain layer and represent errors related to business rules.

### Base Domain Exception

```typescript
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### Entity Exceptions

```typescript
export class EntitySaveException extends DomainException {
  constructor(entityName: string, message: string) {
    super(`Failed to save ${entityName}: ${message}`);
  }
}

export class EntityDeleteException extends DomainException {
  constructor(entityName: string, message: string) {
    super(`Failed to delete ${entityName}: ${message}`);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier ${identifier} not found`);
  }
}
```

### Value Object Exceptions

```typescript
export class InvalidValueObjectException extends DomainException {
  constructor(valueObjectName: string, value: any, reason?: string) {
    const reasonMessage = reason ? `: ${reason}` : '';
    super(`Invalid ${valueObjectName} value: ${value}${reasonMessage}`);
  }
}

export class InvalidPermissionException extends DomainException {
  constructor(message: string) {
    super(`Invalid permission: ${message}`);
  }
}

export class InvalidRoleException extends DomainException {
  constructor(message: string) {
    super(`Invalid role: ${message}`);
  }
}
```

### Repository Exceptions

```typescript
export class RepositoryException extends DomainException {
  constructor(repositoryName: string, operation: string, message: string) {
    super(`${repositoryName} ${operation} operation failed: ${message}`);
  }
}
```

## Global Exception Filter

The application uses a global exception filter to handle exceptions and convert them to appropriate HTTP responses.

```typescript
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = null;

    // Handle different types of exceptions
    if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      code = 'NOT_FOUND';
    } else if (exception instanceof InvalidValueObjectException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'INVALID_INPUT';
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message || 'Unauthorized';
      code = 'UNAUTHORIZED';
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message || 'Forbidden';
      code = 'FORBIDDEN';
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'Bad request';
      code = 'BAD_REQUEST';
      
      // Handle validation errors
      if (exception instanceof ValidationError || exception.response?.message instanceof Array) {
        const validationErrors = exception.response?.message || exception.message;
        code = 'VALIDATION_ERROR';
        details = this.formatValidationErrors(validationErrors);
      }
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'DOMAIN_ERROR';
    }

    // Log the error
    this.logError(exception, request, status, code);

    // Return the error response
    response.status(status).json({
      success: false,
      data: null,
      meta: null,
      error: {
        code,
        message,
        details,
        stack: this.shouldIncludeStack() ? exception.stack : undefined,
      },
    });
  }

  private shouldIncludeStack(): boolean {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    return env === 'development';
  }

  private logError(exception: any, request: Request, status: number, code: string): void {
    const logMessage = {
      status,
      code,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}: ${exception.message}`,
        exception.stack,
        logMessage,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${exception.message}`,
        logMessage,
      );
    }
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    // Extract validation error messages
    if (Array.isArray(errors)) {
      errors.forEach((error) => {
        const property = error.property;
        const constraints = error.constraints;

        if (property && constraints) {
          result[property] = Object.values(constraints);
        }
      });
    }

    return result;
  }
}
```

## Exception Registration

The global exception filter is registered in the main application module:

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(app.get(ApiExceptionFilter));
```

## Using Exceptions

### In Domain Layer

In the domain layer, exceptions are used to enforce business rules:

```typescript
public static create(resource: ResourceType | string): Resource {
  if (!Object.values(ResourceType).includes(resource as ResourceType)) {
    throw new InvalidValueObjectException('Resource', resource, 'Resource type not recognized');
  }

  return new Resource({ value: resource as ResourceType });
}
```

### In Application Layer

In the application layer, exceptions are used to handle business logic errors:

```typescript
async execute(query: GetPermissionQuery): Promise<PermissionDto> {
  const permission = await this.permissionRepository.findById(query.id);

  if (!permission) {
    throw new EntityNotFoundException('Permission', query.id);
  }

  return this.permissionMapper.toDto(permission);
}
```

### In Infrastructure Layer

In the infrastructure layer, exceptions are used to handle technical errors:

```typescript
async save(permission: Permission): Promise<void> {
  try {
    await this.prisma.permission.upsert({
      // ...
    });
  } catch (error) {
    this.logger.error(`Error saving permission: ${error.message}`);
    throw new EntitySaveException('Permission', error.message);
  }
}
```

## Exception Handling Best Practices

1. **Use domain-specific exceptions**: Create exceptions that reflect domain concepts
2. **Let exceptions bubble up**: Don't catch exceptions unless you can handle them
3. **Include meaningful messages**: Error messages should be descriptive
4. **Don't expose sensitive data**: Filter sensitive data from error messages
5. **Log exceptions**: Log exceptions with appropriate severity levels
6. **Transform exceptions**: Convert technical exceptions to domain exceptions
7. **Use status codes appropriately**: Map exceptions to appropriate HTTP status codes

## Error Responses

API error responses follow a consistent format:

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      "property1": ["Error message 1", "Error message 2"],
      "property2": ["Error message 3"]
    }
  }
}
```