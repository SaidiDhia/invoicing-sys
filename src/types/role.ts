import { Permission } from './permission';
import { DatabaseEntity } from './response/DatabaseEntity';

export interface Role extends DatabaseEntity {
  id?: number;
  label?: string;
  description?: string;
  permissionsEntries?: RolePermissionEntry[];
}

export interface CreateRoleDto {
  label?: string;
  description?: string;
  permissionsIds?: (number | undefined)[];
}

export interface UpdateRoleDto extends CreateRoleDto {}

export interface RolePermissionEntry extends DatabaseEntity {
  role?: Role;
  roleId?: number;
  permission?: Permission;
  permissionId?: number;
}
