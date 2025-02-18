import PermissionMain from '@/components/administrative-tools/UserManagement/permission/PermissionMain';
import UserManagementSettings from '@/components/administrative-tools/UserManagementSettings';
import React from 'react';

export default function Page() {
  return (
    <UserManagementSettings>
      <PermissionMain />
    </UserManagementSettings>
  );
}
