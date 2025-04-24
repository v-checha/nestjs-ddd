import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: string): Promise<Permission[]>;
  save(permission: Permission): Promise<void>;
  findAll(): Promise<Permission[]>;
  delete(id: string): Promise<void>;
}
