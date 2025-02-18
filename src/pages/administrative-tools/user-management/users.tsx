import React from 'react';
import UserManagementSettings from '@/components/administrative-tools/UserManagementSettings';
import UserMain from '@/components/administrative-tools/UserManagement/user/UserMain';

export default function Page() {
  return (
    <UserManagementSettings>
      <UserMain />
    </UserManagementSettings>
  );
}
