import React, { createContext, useContext, useState } from 'react';
import { Models } from 'react-native-appwrite';
import { useAccount, useUpdateName } from '@/lib/hooks/useAccount';
import { usePreferences, useUpdatePreferences } from '@/lib/hooks/usePreferences';

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    updateName: (name: string) => Promise<void>;
    updatePreferences: (key: string, value: any) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  
  const { data: userData, isLoading } = useAccount();
  const updateNameMutation = useUpdateName();
  const updatePrefsMutation = useUpdatePreferences();

  const updateName = async (name: string) => {
    try {
      await updateNameMutation.mutateAsync(name);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const updatePreferences = async (key: string, value: any) => {
    try {
      await updatePrefsMutation.mutateAsync({ key, value });
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const value = {
    user: userData || null,
    isLoading,
    error,
    actions: {
      updateName,
      updatePreferences,
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 