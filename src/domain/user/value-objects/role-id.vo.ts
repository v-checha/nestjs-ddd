import { ValueObject } from '../../common/base/value-object.base';
import { v4 as uuidv4 } from 'uuid';

interface RoleIdProps {
  value: string;
}

export class RoleId extends ValueObject<RoleIdProps> {
  private constructor(props: RoleIdProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(id?: string): RoleId {
    return new RoleId({ value: id || uuidv4() });
  }

  public toString(): string {
    return this.props.value;
  }
}