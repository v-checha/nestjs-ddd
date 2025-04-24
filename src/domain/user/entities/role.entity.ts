import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from './permission.entity';

interface RoleProps {
  name: string;
  description: string;
  permissions: Permission[];
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
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id ?? uuidv4(),
    );
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
