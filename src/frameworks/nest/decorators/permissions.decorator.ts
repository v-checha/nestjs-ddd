import { SetMetadata } from '@nestjs/common';
import { Resource } from '@domain/user/value-objects/resource.vo';
import { PermissionAction } from '@domain/user/value-objects/permission-action.vo';

export type PermissionString = string;

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: PermissionString[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Helper function to create a permission string in the correct format
 */
export const createPermissionString = (
  resource: string | Resource,
  action: string | PermissionAction,
): PermissionString => {
  const resourceStr = resource instanceof Resource ? resource.toString() : resource;
  const actionStr = action instanceof PermissionAction ? action.toString() : action;

  return `${resourceStr}:${actionStr}`;
};
