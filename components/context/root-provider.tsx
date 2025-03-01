import React from 'react';
import { AuthProvider } from './core/auth-provider';
import { ProfileProvider } from './core/profile-provider';
import { MembershipProvider } from './core/membership-provider';
import { DepartmentProvider } from './core/department-provider';

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <MembershipProvider>
          <DepartmentProvider>
            {children}
          </DepartmentProvider>
        </MembershipProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}; 