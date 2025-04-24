import { Role } from '../entities/role.entity';

export interface RoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  save(role: Role): Promise<void>;
  findAll(): Promise<Role[]>;
  delete(id: string): Promise<void>;
}
