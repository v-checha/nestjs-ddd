import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from './permission.entity';

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

interface RoleProps {
  name: string;
  description: string;
  permissions: Permission[];
  type?: RoleType;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends Entity<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get permissions(): Permission[] {
    return this.props.permissions;
  }

  get type(): RoleType {
    return this.props.type ?? RoleType.USER;
  }
  
  get isDefault(): boolean {
    return this.props.isDefault ?? false;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public static create(props: RoleProps, id?: string): Role {
    return new Role(
      {
        ...props,
        type: props.type ?? RoleType.USER,
        isDefault: props.isDefault ?? false,
        permissions: props.permissions || [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id ?? uuidv4(),
    );
  }
  
  /**
   * Create a predefined role with appropriate permissions
   */
  public static createPredefinedRole(type: RoleType, permissions: Permission[] = []): Role {
    let name = '';
    let description = '';
    
    switch (type) {
      case RoleType.SUPER_ADMIN:
        name = 'Super Administrator';
        description = 'Complete access to all system resources and functionalities';
        break;
      case RoleType.ADMIN:
        name = 'Administrator';
        description = 'Administrative access to system resources';
        break;
      case RoleType.MODERATOR:
        name = 'Moderator';
        description = 'Manage and moderate user generated content';
        break;
      case RoleType.USER:
        name = 'User';
        description = 'Standard user access';
        break;
      case RoleType.GUEST:
        name = 'Guest';
        description = 'Limited access to public resources';
        break;
    }
    
    return Role.create({
      name,
      description,
      permissions,
      type,
      isDefault: type === RoleType.USER, // Make the regular user role default
    });
  }

  public updateDetails(name: string, description: string): void {
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  public addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.id)) {
      this.props.permissions.push(permission);
      this.props.updatedAt = new Date();
    }
  }

  public removePermission(permissionId: string): void {
    this.props.permissions = this.props.permissions.filter(
      (permission) => permission.id !== permissionId,
    );
    this.props.updatedAt = new Date();
  }

  public hasPermission(permissionId: string): boolean {
    return this.props.permissions.some((permission) => permission.id === permissionId);
  }
}
