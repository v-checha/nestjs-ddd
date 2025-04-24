import { Role } from '../entities/role.entity';
import { RoleType } from '../value-objects/role-type.vo';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByType(type: RoleType): Promise<Role | null>;
  findDefault(): Promise<Role | null>;
  findAll(page?: number, limit?: number): Promise<PaginatedResult<Role>>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
}