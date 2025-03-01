import React, { createContext, useContext, useCallback } from 'react';
import { Models } from 'react-native-appwrite';
import { useProfile as useProfileQuery } from '@/lib/hooks/useProfile';
import { useAuth } from './auth-provider';
import { databases, updateDocument } from '@/lib/appwrite';

interface Profile extends Models.Document {
  name?: string;
  studentId?: Models.Document;
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
  const { user } = useAuth();
  const { data: profileData, isLoading } = useProfileQuery(user?.$id);

  const updateProfile = useCallback(async (profileData: Partial<Profile>) => {
    if (!user?.$id) return;

    try {
      await databases.updateDocument('app', 'user', user.$id, profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user?.$id]);

  const addStudentId = useCallback(async (studentId: string) => {
    if (!user?.$id) throw new Error('User not found');

    try {
      const newStudentId = await databases.createDocument('app', 'student_id', studentId, {
        student_id: studentId,
      });
      if (newStudentId.$id) {
        await updateDocument('user', user.$id, { 
          student_id: newStudentId.$id, 
          studentId: newStudentId.$id 
        });
      }
    } catch (error) {
      console.error('Error adding student ID:', error);
    }
  }, [user?.$id]);

  const value = {
    profile: profileData || null,
    isLoading,
    actions: {
      updateProfile,
      addStudentId,
    },
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 