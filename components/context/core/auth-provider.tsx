import React, { createContext, useContext } from 'react';
import { Models } from 'react-native-appwrite';
import { useAuth as useZustandAuth } from '@/lib/hooks/useAuthStore';

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    updateName: (name: string) => Promise<void>;
    updatePreferences: (key: string, value: any) => Promise<void>;
    refetch: () => Promise<unknown>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our new Zustand-based hook
  const { user, isLoading, error, actions } = useZustandAuth();
  
  const value = {
    user,
    isLoading,
    error,
    actions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 