import React from 'react';
import { AuthProvider } from './core/auth-provider';
import { ProfileProvider } from './core/profile-provider';
import { MembershipProvider } from './core/membership-provider';
import { DepartmentProvider } from './core/department-provider';

/**
 * Root provider for the application
 * 
 * Migration Status:
 * - AuthProvider: ✅ Migrated to Zustand (lib/stores/authStore.ts)
 * - ProfileProvider: ✅ Migrated to Zustand (lib/stores/profileStore.ts)
 * - MembershipProvider: ✅ Migrated to Zustand (lib/stores/membershipStore.ts)
 * - DepartmentProvider: ✅ Migrated to Zustand (lib/stores/departmentStore.ts)
 * 
 * All context providers have been migrated to Zustand but kept as compatibility layer
 * for existing components. New components should access state directly from Zustand stores
 * for better performance.
 */
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