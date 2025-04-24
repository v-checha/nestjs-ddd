import { DomainException } from '../../common/exceptions/domain.exception';

export class InvalidUserException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
