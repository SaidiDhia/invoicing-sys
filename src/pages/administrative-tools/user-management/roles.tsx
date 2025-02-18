import RoleMain from '@/components/administrative-tools/UserManagement/role/RoleMain';
import UserManagementSettings from '@/components/administrative-tools/UserManagementSettings';
import React from 'react';

export default function Page() {
  return (
    <UserManagementSettings>
      <RoleMain />
    </UserManagementSettings>
  );
}
