import { Entity } from '../../common/base/entity.base';
import { Resource } from '../value-objects/resource.vo';
import { PermissionAction } from '../value-objects/permission-action.vo';
import { PermissionId } from '../value-objects/permission-id.vo';
import { PermissionName } from '../value-objects/permission-name.vo';

interface PermissionProps {
  name: PermissionName;
  description: string;
  resource: Resource;
  action: PermissionAction;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Permission extends Entity<PermissionProps> {
  private constructor(props: PermissionProps, id?: string) {
    super(props, id);
  }

  get permissionId(): PermissionId {
    return PermissionId.create(this.id);
  }

  get name(): string {
    return this.props.name.value;
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

  public static create(props: {
    name: string;
    description: string;
    resource: string | Resource;
    action: string | PermissionAction;
    createdAt?: Date;
    updatedAt?: Date;
  }, id?: string): Permission {
    const resource = props.resource instanceof Resource 
      ? props.resource 
      : Resource.create(props.resource);
      
    const action = props.action instanceof PermissionAction
      ? props.action
      : PermissionAction.create(props.action);

    const name = props.name 
      ? PermissionName.create(props.name)
      : PermissionName.fromResourceAndAction(resource, action);

    return new Permission(
      {
        name,
        description: props.description,
        resource,
        action,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public updateDetails(name: string, description: string): void {
    this.props = {
      ...this.props,
      name: PermissionName.create(name),
      description,
      updatedAt: new Date(),
    };
  }

  /**
   * Returns a string representation of the permission in the format "resource:action"
   */
  public getPermissionString(): string {
    return `${this.props.resource.toString()}:${this.props.action.toString()}`;
  }

  /**
   * Creates a permission from a string representation in the format "resource:action"
   */
  public static fromString(permissionString: string, name?: string, description?: string): Permission {
    const [resourceStr, actionStr] = permissionString.split(':');
    
    if (!resourceStr || !actionStr) {
      throw new Error(`Invalid permission string: ${permissionString}`);
    }
    
    return Permission.create({
      name: name || permissionString,
      description: description || `Permission to ${actionStr} ${resourceStr}`,
      resource: resourceStr,
      action: actionStr,
    });
  }
}