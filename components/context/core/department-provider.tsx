import React, { createContext, useContext } from 'react';
import { Models } from 'react-native-appwrite';
import { useProfile } from './profile-provider';
import { 
  useDepartmentData, 
  useFollowedDepartments, 
  useToggleDepartmentFollow 
} from '@/lib/hooks/useCampusData';

interface DepartmentContextType {
  userDepartment: Models.Document | null;
  followedDepartments: Models.Document[];
  isLoading: boolean;
  actions: {
    toggleDepartmentFollow: (department: Models.Document) => Promise<void>;
  };
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useProfile();
  
  const { data: departmentData, isLoading: departmentLoading } = useDepartmentData(
    profile?.departments_ids?.[0]
  );
  
  const { 
    data: followedDepartmentsData, 
    isLoading: followedDepartmentsLoading 
  } = useFollowedDepartments(profile?.$id);
  
  const toggleDepartmentFollow = useToggleDepartmentFollow();

  const onToggleDepartmentFollow = async (department: Models.Document) => {
    if (!profile?.$id) return;
    
    try {
      await toggleDepartmentFollow.mutateAsync({
        userId: profile.$id,
        departmentId: department.$id,
      });
    } catch (error) {
      console.error('Error updating followed units:', error);
    }
  };

  const value = {
    userDepartment: departmentData || null,
    followedDepartments: followedDepartmentsData || [],
    isLoading: departmentLoading || followedDepartmentsLoading,
    actions: {
      toggleDepartmentFollow: onToggleDepartmentFollow,
    },
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
}; 