import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccount, updateUserName, getUserPreferences, updateUserPreferences, getDocument, updateDocument, databases } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';


interface Profile extends Models.Document {
  name?: string;
  studentId?: string;
  address?: string;
  city?: string;
  zip?: string;
  bank_account?: string;
  campus?: string;
  campus_id?: string;
  departments?: string[];
  departments_id?: string[];
}

export interface AuthContextType {
  data: Models.User<Models.Preferences> | null;
  profile: Models.Document | null;
  isLoading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  updateUserPrefs: (key: string, value: any) => Promise<void>;
  refetchUser: () => Promise<void>;
  membershipExpiry: Date | null;
  isBisoMember: boolean;
  setMembershipExpiry: (expiry: Date | null) => void;
  setIsBisoMember: (isBisoMember: boolean) => void;
  studentId: string | null;
  addStudentId: (studentId: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;

}
// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Models.Document | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBisoMember, setIsBisoMember] = useState(false);
  const [membershipExpiry, setMembershipExpiry] = useState<Date | null>(null);
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

  const updateProfile = async ({
    name,
    studentId,
    address,
    city,
    zip,
    bank_account,
    campus,
    campus_id,
    departments,
    departments_ids,
  }: Partial<Profile>) => {

    if (!data?.$id) {
      return;
    }

    try {
      const response = await databases.updateDocument('app', 'user', data.$id, {
        name,
        studentId,
        address,
        city,
        zip,
        bank_account,
        campus,
        campus_id,
        departments,
        departments_ids,
      });
      setProfile(response);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.studentId) {
      setStudentId(profile.studentId);
    }
  }, [profile]);

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

  const addStudentId = async (studentId: string) => {
    if (!data || !data.$id) {
      throw new Error('User not found');
    }
    try {
      console.log('Adding student ID to user profile: ', studentId);
      //Make this a function trigger instead. This way we'll be able to verify that the studentId doesn't already exist
      const response = await updateDocument('user', data.$id, { 
        studentId: {
          student_id: studentId,
        }
       });
      setProfile(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error adding student ID to user profile:', err);
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const fetchBisoMembership = async () => {
    if (!profile?.studentId) {
      return;
    }
    const membershipStatus = profile.studentId.isMember;
    if (membershipStatus === true) {
      setIsBisoMember(true);
    } else {
      setIsBisoMember(false);
    }
  };

  useEffect(() => {
    fetchBisoMembership();
  }, [profile]);


  const refetchUser = fetchAccount;

  return (
    <AuthContext.Provider value={{ data, profile, isLoading, error, updateName, updateUserPrefs, refetchUser, membershipExpiry, isBisoMember, setMembershipExpiry, setIsBisoMember, studentId, addStudentId, updateProfile }}>
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
