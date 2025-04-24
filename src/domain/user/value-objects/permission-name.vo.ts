import { ValueObject } from '../../common/base/value-object.base';
import { Resource } from './resource.vo';
import { PermissionAction } from './permission-action.vo';
import { InvalidValueObjectException } from '../../common/exceptions/domain.exception';

interface PermissionNameProps {
  value: string;
}

export class PermissionName extends ValueObject<PermissionNameProps> {
  private constructor(props: PermissionNameProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(name: string): PermissionName {
    if (!name || name.trim().length === 0) {
      throw new InvalidValueObjectException('PermissionName', name, 'Permission name cannot be empty');
    }

    if (name.length < 3) {
      throw new InvalidValueObjectException('PermissionName', name, 'Permission name must be at least 3 characters long');
    }

    if (name.length > 50) {
      throw new InvalidValueObjectException('PermissionName', name, 'Permission name must be less than 50 characters long');
    }

    return new PermissionName({ value: name });
  }

  public static fromResourceAndAction(resource: Resource, action: PermissionAction): PermissionName {
    return this.create(`${resource.toString()}:${action.toString()}`);
  }

  public toString(): string {
    return this.props.value;
  }
}