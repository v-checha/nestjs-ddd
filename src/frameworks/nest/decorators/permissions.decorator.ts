import { SetMetadata } from '@nestjs/common';
import { Resource, PermissionAction } from '../../../domain/user/entities/permission.entity';

export type PermissionString = `${Resource}:${PermissionAction}`;

export const RequirePermissions = (...permissions: PermissionString[]) => 
  SetMetadata('permissions', permissions);
  
/**
 * Helper function to create a permission string in the correct format
 */
export const createPermissionString = (resource: Resource, action: PermissionAction): PermissionString => {
  return `${resource}:${action}` as PermissionString;
};