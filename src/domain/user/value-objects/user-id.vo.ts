import { ValueObject } from '../../common/base/value-object.base';
import { v4 as uuidv4 } from 'uuid';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(id?: string): UserId {
    return new UserId({ value: id ?? uuidv4() });
  }
}
