export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

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
