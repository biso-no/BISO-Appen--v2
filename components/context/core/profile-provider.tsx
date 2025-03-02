import React, { createContext, useContext } from 'react';
import { Models } from 'react-native-appwrite';
import { useZustandProfile } from '@/lib/hooks/useProfileStore';

interface Profile extends Models.Document {
  name?: string;
  studentId?: Models.Document | string;
  student_id?: string;
  address?: string;
  city?: string;
  zip?: string;
  bank_account?: string;
  campus?: string;
  campus_id?: string;
  departments?: Models.Document[];
  departments_id?: string[];
  avatar?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  actions: {
    updateProfile: (profile: Partial<Profile>) => Promise<void>;
    addStudentId: (studentId: string) => Promise<void>;
    refetch: () => Promise<any>;
  };
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our new Zustand-based hook
  const { profile, isLoading, actions } = useZustandProfile();
  
  const value = {
    profile,
    isLoading,
    actions,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 