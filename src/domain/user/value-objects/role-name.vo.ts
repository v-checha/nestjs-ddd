import { ValueObject } from '../../common/base/value-object.base';
import { InvalidValueObjectException } from '../../common/exceptions/domain.exception';

interface RoleNameProps {
  value: string;
}

export class RoleName extends ValueObject<RoleNameProps> {
  private constructor(props: RoleNameProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(name: string): RoleName {
    if (!name || name.trim().length === 0) {
      throw new InvalidValueObjectException('RoleName', name, 'Role name cannot be empty');
    }

    if (name.length < 3) {
      throw new InvalidValueObjectException(
        'RoleName',
        name,
        'Role name must be at least 3 characters long',
      );
    }

    if (name.length > 50) {
      throw new InvalidValueObjectException(
        'RoleName',
        name,
        'Role name must be less than 50 characters long',
      );
    }

    return new RoleName({ value: name });
  }

  public toString(): string {
    return this.props.value;
  }
}
