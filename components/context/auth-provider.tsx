import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccount, updateUserName, getUserPreferences, updateUserPreferences, getDocument, updateDocument, databases, subScribeToProfile } from '@/lib/appwrite';
import { Models, RealtimeResponseEvent } from 'react-native-appwrite';

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
  departments?: string[];
  departments_id?: string[];
  avatar?: string;
}

export interface AuthContextType {
  data: Models.User<Models.Preferences> | null;
  profile: Profile | null;
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
  userCampus: Models.Document | null;
  userDepartment: Models.Document | null;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBisoMember, setIsBisoMember] = useState(false);
  const [membershipExpiry, setMembershipExpiry] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCampus, setUserCampus] = useState<Models.Document | null>(null);
  const [userDepartment, setUserDepartment] = useState<Models.Document | null>(null);

  const fetchAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAccount();
      setData(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (data?.$id) {
      try {
        const response = await getDocument('user', data.$id);
        setProfile(response as Profile);
        setStudentId(response.student_id);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setProfile(null);
      }
    }
  }, [data]);

  const fetchCampus = useCallback(async () => {
    if (profile?.$id && profile.campus_id) {
      try {
        const response = await getDocument('campus', profile.campus_id);
        setUserCampus(response);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setUserCampus(null);
      }
    }
  }, [data]);

  const fetchDepartment = useCallback(async () => {
    if (profile?.$id && profile.departments_id) {
      try {
        const response = await getDocument('department', profile.departments_id[0]);
        setUserDepartment(response);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setUserDepartment(null);
      }
    }
  }, [data]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchCampus();
  }, [fetchCampus]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!data?.$id) return;

    try {
      const response = await databases.updateDocument('app', 'user', data.$id, profileData);
      setProfile(response as Profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateName = async (name: string) => {
    try {
      const response = await updateUserName(name);
      setData(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const updateUserPrefs = async (key: string, value: any) => {
    try {
      const currentPrefs = await getUserPreferences();
      const updatedPrefs = { ...currentPrefs, [key]: value };
      const response = await updateUserPreferences(updatedPrefs);
      console.log('Preferences successfully updated', response);
    } catch (err: unknown) {
      console.error('Error updating preferences', err);
    }
  };

  const addStudentId = async (studentId: string) => {
    if (!data?.$id) throw new Error('User not found');

    try {
      console.log('Adding student ID to user profile:', studentId);
      const response = await updateDocument('student_id', studentId, { user: data.$id });
      if (response.$id) {
        setStudentId(studentId);
        fetchProfile();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  useEffect(() => {
    if (data?.$id) {
      const unsubscribe = subScribeToProfile({
        profileId: data.$id,
        studentId: profile?.student_id,
        callback: (response: RealtimeResponseEvent<Models.Document>) => {
          const payload = response.payload;
          if (payload.$collectionId === 'student_id' && payload.$id === profile?.student_id) {
            setIsBisoMember(payload.isMember);
          } else if (payload.$collectionId === 'user' && payload.$id === data.$id) {
            fetchProfile();
          }
        },
      });
      return () => {
        unsubscribe();
      };
    }
  }, [data?.$id, profile?.studentId]);

  useEffect(() => {
    if (profile?.studentId) {
      const studentIdDoc = profile.studentId
      setIsBisoMember(studentIdDoc.isMember || false);
    }
  }, [profile]);

  const refetchUser = fetchAccount;

  return (
    <AuthContext.Provider value={{
      data,
      profile,
      isLoading,
      error,
      updateName,
      updateUserPrefs,
      refetchUser,
      membershipExpiry,
      isBisoMember,
      setMembershipExpiry,
      setIsBisoMember,
      studentId,
      addStudentId,
      updateProfile,
      userCampus,
      userDepartment
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
