import { ValueObject } from '../../common/base/value-object.base';
import { InvalidValueObjectException } from '../../common/exceptions/domain.exception';

export enum RoleTypeEnum {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

interface RoleTypeProps {
  value: RoleTypeEnum;
}

export class RoleType extends ValueObject<RoleTypeProps> {
  private constructor(props: RoleTypeProps) {
    super(props);
  }

  public get value(): RoleTypeEnum {
    return this.props.value;
  }

  public static create(type: RoleTypeEnum | string): RoleType {
    if (!Object.values(RoleTypeEnum).includes(type as RoleTypeEnum)) {
      throw new InvalidValueObjectException('RoleType', type, 'Role type not recognized');
    }

    return new RoleType({ value: type as RoleTypeEnum });
  }

  public toString(): string {
    return this.props.value;
  }

  public static isValid(type: string): boolean {
    return Object.values(RoleTypeEnum).includes(type as RoleTypeEnum);
  }

  public static getAll(): RoleTypeEnum[] {
    return Object.values(RoleTypeEnum);
  }

  public isSuperAdmin(): boolean {
    return this.props.value === RoleTypeEnum.SUPER_ADMIN;
  }

  public isAdmin(): boolean {
    return this.props.value === RoleTypeEnum.ADMIN || this.isSuperAdmin();
  }

  public isModerator(): boolean {
    return this.props.value === RoleTypeEnum.MODERATOR || this.isAdmin();
  }

  public isUser(): boolean {
    return this.props.value === RoleTypeEnum.USER;
  }

  public isGuest(): boolean {
    return this.props.value === RoleTypeEnum.GUEST;
  }
}
