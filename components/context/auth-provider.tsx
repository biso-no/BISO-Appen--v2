import React, { createContext, useContext } from 'react';
import { useAppwriteAccount } from './auth-context';
import { Models } from 'appwrite';

// Define the shape of your context state and functions
interface AuthContextType {
  data: Models.User<Models.Preferences> | null;
  profile: Models.Document | null;
  isLoading: boolean;
  error: string | null;
  // Include any auth-related functions you want to expose
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, profile, isLoading, error } = useAppwriteAccount();
  
    return (
      <AuthContext.Provider value={{ data, profile, isLoading, error }}>
        {children}
      </AuthContext.Provider>
    );
  };

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};