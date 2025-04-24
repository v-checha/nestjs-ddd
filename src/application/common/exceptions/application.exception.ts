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