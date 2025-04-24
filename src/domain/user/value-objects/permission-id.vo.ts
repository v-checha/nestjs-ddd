import { ValueObject } from '../../common/base/value-object.base';
import { v4 as uuidv4 } from 'uuid';

interface PermissionIdProps {
  value: string;
}

export class PermissionId extends ValueObject<PermissionIdProps> {
  private constructor(props: PermissionIdProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(id?: string): PermissionId {
    return new PermissionId({ value: id || uuidv4() });
  }

  public toString(): string {
    return this.props.value;
  }
}
