import { ValueObject } from '../../common/base/value-object.base';
import { InvalidValueObjectException } from '../../common/exceptions/domain.exception';

export enum ResourceType {
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
  CHAT = 'chat',
}

interface ResourceProps {
  value: ResourceType;
}

export class Resource extends ValueObject<ResourceProps> {
  private constructor(props: ResourceProps) {
    super(props);
  }

  public get value(): ResourceType {
    return this.props.value;
  }

  public static create(resource: ResourceType | string): Resource {
    if (!Object.values(ResourceType).includes(resource as ResourceType)) {
      throw new InvalidValueObjectException('Resource', resource, 'Resource type not recognized');
    }

    return new Resource({ value: resource as ResourceType });
  }

  public toString(): string {
    return this.props.value;
  }

  public static isValid(resource: string): boolean {
    return Object.values(ResourceType).includes(resource as ResourceType);
  }

  public static getAll(): ResourceType[] {
    return Object.values(ResourceType);
  }
}
