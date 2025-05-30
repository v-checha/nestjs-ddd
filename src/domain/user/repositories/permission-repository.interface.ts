import { Permission } from '../entities/permission.entity';
import { Resource } from '../value-objects/resource.vo';
import { PermissionAction } from '../value-objects/permission-action.vo';
import { PaginatedResult } from './role-repository.interface';

export interface PermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: Resource): Promise<Permission[]>;
  findByAction(action: PermissionAction): Promise<Permission[]>;
  findByResourceAndAction(resource: Resource, action: PermissionAction): Promise<Permission | null>;
  save(permission: Permission): Promise<void>;
  saveMany(permissions: Permission[]): Promise<void>;
  findAll(page?: number, limit?: number): Promise<PaginatedResult<Permission>>;
  delete(id: string): Promise<void>;
}
