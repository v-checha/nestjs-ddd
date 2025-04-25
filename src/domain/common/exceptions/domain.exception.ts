export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Entity exceptions
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

// Value object exceptions
export class InvalidValueObjectException extends DomainException {
  constructor(valueObjectName: string, value: unknown, reason?: string) {
    const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const reasonMessage = reason ? `: ${reason}` : '';
    super(`Invalid ${valueObjectName} value: ${formattedValue}${reasonMessage}`);
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

// Repository exceptions
export class RepositoryException extends DomainException {
  constructor(repositoryName: string, operation: string, message: string) {
    super(`${repositoryName} ${operation} operation failed: ${message}`);
  }
}
