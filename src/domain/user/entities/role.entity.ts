import { Entity } from '../../common/base/entity.base';
import { Permission } from './permission.entity';
import { RoleId } from '../value-objects/role-id.vo';
import { RoleName } from '../value-objects/role-name.vo';
import { RoleType, RoleTypeEnum } from '../value-objects/role-type.vo';
import { Resource } from '../value-objects/resource.vo';
import { PermissionAction, ActionType } from '../value-objects/permission-action.vo';

interface RoleProps {
  name: RoleName;
  description: string;
  type: RoleType;
  isDefault: boolean;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends Entity<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  get roleId(): RoleId {
    return RoleId.create(this.id);
  }

  get name(): string {
    return this.props.name.value;
  }

  get description(): string {
    return this.props.description;
  }

  get type(): RoleType {
    return this.props.type;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get permissions(): Permission[] {
    return this.props.permissions;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public static create(
    props: {
      name: string;
      description: string;
      permissions: Permission[];
      type?: string | RoleType;
      isDefault?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    },
    id?: string,
  ): Role {
    const roleType =
      props.type instanceof RoleType
        ? props.type
        : RoleType.create(props.type || RoleTypeEnum.USER);

    return new Role(
      {
        name: RoleName.create(props.name),
        description: props.description,
        type: roleType,
        isDefault: props.isDefault ?? false,
        permissions: props.permissions || [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  /**
   * Create a predefined role with appropriate permissions
   */
  public static createPredefinedRole(
    type: string | RoleType,
    permissions: Permission[] = [],
  ): Role {
    const roleType = type instanceof RoleType ? type : RoleType.create(type);
    let name = '';
    let description = '';
    let isDefault = false;

    switch (roleType.value) {
      case RoleTypeEnum.SUPER_ADMIN:
        name = 'Super Administrator';
        description = 'Complete access to all system resources and functionalities';
        break;
      case RoleTypeEnum.ADMIN:
        name = 'Administrator';
        description = 'Administrative access to system resources';
        break;
      case RoleTypeEnum.MODERATOR:
        name = 'Moderator';
        description = 'Manage and moderate user generated content';
        break;
      case RoleTypeEnum.USER:
        name = 'User';
        description = 'Standard user access';
        isDefault = true;
        break;
      case RoleTypeEnum.GUEST:
        name = 'Guest';
        description = 'Limited access to public resources';
        break;
    }

    return Role.create({
      name,
      description,
      permissions,
      type: roleType,
      isDefault,
    });
  }

  public updateDetails(name: string, description: string): void {
    this.props = {
      ...this.props,
      name: RoleName.create(name),
      description,
      updatedAt: new Date(),
    };
  }

  public setDefault(isDefault: boolean): void {
    this.props = {
      ...this.props,
      isDefault,
      updatedAt: new Date(),
    };
  }

  public addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.id)) {
      this.props = {
        ...this.props,
        permissions: [...this.props.permissions, permission],
        updatedAt: new Date(),
      };
    }
  }

  public removePermission(permissionId: string): void {
    this.props = {
      ...this.props,
      permissions: this.props.permissions.filter(permission => permission.id !== permissionId),
      updatedAt: new Date(),
    };
  }

  public hasPermission(permissionId: string): boolean {
    return this.props.permissions.some(permission => permission.id === permissionId);
  }

  public hasPermissionFor(resource: string | Resource, action: string | PermissionAction): boolean {
    const resourceObj = resource instanceof Resource ? resource : Resource.create(resource);
    const actionObj = action instanceof PermissionAction ? action : PermissionAction.create(action);

    // Super admin has access to everything
    if (this.type.isSuperAdmin()) {
      return true;
    }

    return this.props.permissions.some(
      permission =>
        permission.resource.value === resourceObj.value &&
        (permission.action.value === actionObj.value ||
          permission.action.value === ActionType.MANAGE),
    );
  }
}
