import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';

interface PermissionProps {
  name: string;
  description: string;
  resource: Resource;
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

export enum Resource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  PROFILE = 'profile',
  POST = 'post',
  COMMENT = 'comment',
  CATEGORY = 'category',
  TAG = 'tag',
  MEDIA = 'media',
  SETTINGS = 'settings',
  ANALYTICS = 'analytics',
  AUDIT = 'audit',
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

  get resource(): Resource {
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

  /**
   * Returns a string representation of the permission in the format "resource:action"
   */
  public getPermissionString(): string {
    return `${this.props.resource}:${this.props.action}`;
  }

  /**
   * Creates a permission from a string representation in the format "resource:action"
   */
  public static fromString(permissionString: string, name?: string, description?: string): Permission {
    const [resourceStr, actionStr] = permissionString.split(':');
    
    if (!resourceStr || !actionStr) {
      throw new Error(`Invalid permission string: ${permissionString}`);
    }
    
    if (!Object.values(Resource).includes(resourceStr as Resource)) {
      throw new Error(`Invalid resource: ${resourceStr}`);
    }
    
    if (!Object.values(PermissionAction).includes(actionStr as PermissionAction)) {
      throw new Error(`Invalid action: ${actionStr}`);
    }
    
    const resource = resourceStr as Resource;
    const action = actionStr as PermissionAction;
    
    return Permission.create({
      name: name || `${resource}:${action}`,
      description: description || `Permission to ${action} ${resource}`,
      resource,
      action,
    });
  }
}