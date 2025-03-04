import React, { createContext, useContext } from 'react';
import { Models } from 'react-native-appwrite';
import { useZustandDepartment } from '@/lib/hooks/useDepartmentStore';

interface DepartmentContextType {
  userDepartment: Models.Document | null;
  followedDepartments: Models.Document[];
  isLoading: boolean;
  actions: {
    toggleDepartmentFollow: (department: Models.Document) => Promise<void>;
    refetchFollowedDepartments: () => Promise<any>;
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
  // Use our new Zustand-based hook
  const { userDepartment, followedDepartments, isLoading, actions } = useZustandDepartment();
  
  const value = {
    userDepartment,
    followedDepartments,
    isLoading,
    actions
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
}; 