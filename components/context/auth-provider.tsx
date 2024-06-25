import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccount, updateUserName, getUserPreferences, updateUserPreferences, getDocument } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

// Define the shape of your context state and functions
export interface AuthContextType {
  data: Models.User<Models.Preferences> | null;
  profile: Models.Document | null;
  isLoading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  updateUserPrefs: (key: string, value: any) => Promise<void>;
  refetchUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAccount();
      setData(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const fetchProfile = useCallback(async () => {
    if (data && data.$id) {
    try {
      const response = await getDocument('user', data.$id);
      setProfile(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setProfile(null);
    }
    }
  }, [data]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateName = async (name: string) => {
    try {
      const response = await updateUserName(name);
      setData(response); // Update the local state with the new data
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const updateUserPrefs = async (key: string, value: any) => {
    try {
      // Get current preferences
      const currentPrefs = await getUserPreferences();
      // Update the specific key with the new value
      const updatedPrefs = {
        ...currentPrefs,
        [key]: value,
      };
      // Update preferences in Appwrite
      const response = await updateUserPreferences(updatedPrefs);
      // Handle the response, e.g., update local state or show a message
      console.log('Preferences successfully updated', response);
    } catch (err: unknown) {
      // Handle errors, e.g., show an error message
      console.error('Error updating preferences', err);
    }
  };

  const refetchUser = fetchAccount;

  return (
    <AuthContext.Provider value={{ data, profile, isLoading, error, updateName, updateUserPrefs, refetchUser }}>
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
