import { ValueObject } from '../../common/base/value-object.base';
import { InvalidValueObjectException } from '../../common/exceptions/domain.exception';

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full access to the resource
}

interface PermissionActionProps {
  value: ActionType;
}

export class PermissionAction extends ValueObject<PermissionActionProps> {
  private constructor(props: PermissionActionProps) {
    super(props);
  }

  public get value(): ActionType {
    return this.props.value;
  }

  public static create(action: ActionType | string): PermissionAction {
    if (!Object.values(ActionType).includes(action as ActionType)) {
      throw new InvalidValueObjectException('PermissionAction', action, 'Action type not recognized');
    }

    return new PermissionAction({ value: action as ActionType });
  }

  public toString(): string {
    return this.props.value;
  }

  public static isValid(action: string): boolean {
    return Object.values(ActionType).includes(action as ActionType);
  }

  public static getAll(): ActionType[] {
    return Object.values(ActionType);
  }

  public isManageAction(): boolean {
    return this.props.value === ActionType.MANAGE;
  }
}