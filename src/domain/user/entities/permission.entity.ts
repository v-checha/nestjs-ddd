import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';

interface PermissionProps {
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full access to the resource
}

export class Permission extends Entity<PermissionProps> {
  private constructor(props: PermissionProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get resource(): string {
    return this.props.resource;
  }

  get action(): PermissionAction {
    return this.props.action;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public static create(props: PermissionProps, id?: string): Permission {
    return new Permission(
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
}
