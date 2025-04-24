export abstract class ApplicationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(`User with id ${id} not found`);
  }
}

export class EmailAlreadyExistsException extends ApplicationException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class RoleNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(`Role with id ${id} not found`);
  }
}

export class RoleAlreadyExistsException extends ApplicationException {
  constructor(name: string) {
    super(`Role with name ${name} already exists`);
  }
}

export class PermissionNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(`Permission with id ${id} not found`);
  }
}

export class PermissionAlreadyExistsException extends ApplicationException {
  constructor(name: string) {
    super(`Permission with name ${name} already exists`);
  }
}

export class TokenNotFoundException extends ApplicationException {
  constructor() {
    super('Token not found');
  }
}

export class TokenExpiredException extends ApplicationException {
  constructor() {
    super('Token is expired or invalid');
  }
}

export class InvalidTokenTypeException extends ApplicationException {
  constructor() {
    super('Invalid token type');
  }
}
