import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAccount, updateUserName, getUserPreferences, updateUserPreferences, getDocument, updateDocument, databases, subScribeToProfile, functions } from '@/lib/appwrite';
import { Models, Query, RealtimeResponseEvent } from 'react-native-appwrite';
import { useProfileSubscription } from '@/lib/appwrite';
import { usePathname } from 'expo-router';

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

interface Membership {
  membership_id: string;
  name: string;
  price: number;
  category: string;
  status: boolean;
  expiryDate: string;
  $id: string;
}

export interface AuthContextType {
  data: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
  userDepartment: Models.Document | null
  membership: Membership | null;
  followedDepartments: Models.Document[]
  onToggleDepartmentFollow: (department: Models.Document) => void
  setProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBisoMember, setIsBisoMember] = useState(false);
  const [membershipExpiry, setMembershipExpiry] = useState<Date | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCampus, setUserCampus] = useState<Models.Document | null>(null);
  const [userDepartment, setUserDepartment] = useState<Models.Document | null>(null);
  const [followedDepartments, setFollowedDepartments] = useState<Models.Document[]>([]);

  const pathname = usePathname();

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
    if (!data?.$id) return;

    setIsLoading(true);
    try {
      const response = await getDocument('user', data.$id);
      setProfile(response as Profile);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [data?.$id]);

  const fetchStudentId = useCallback(async () => {
    if (!data?.$id) return;

    try {
      const response = await databases.listDocuments('app', 'student_id', [
        Query.select(['student_id']),
      ]);
      console.log("Student Response:", response);
      setStudentId(response.documents[0].student_id);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStudentId(null);
    } finally {
      setIsLoading(false);
    }
  }, [data?.$id]);

  useEffect(() => {
    fetchStudentId();
  }, [fetchStudentId]);

  const fetchCampus = useCallback(async () => {
    if (!profile?.campus_id) return;

    try {
      const response = await getDocument('campus', profile.campus_id);
      setUserCampus(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setUserCampus(null);
    }
  }, [profile?.campus_id]);

  const fetchDepartment = useCallback(async () => {
    if (!profile?.departments_ids?.length) return;

    try {
      const response = await getDocument('department', profile.departments_ids[0]);
      setUserDepartment(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setUserDepartment(null);
    }
  }, [profile?.departments_ids]);

  const onToggleDepartmentFollow = useCallback(async (department: Models.Document) => {
    if (!profile?.$id) return;

    try {
      const response = await databases.listDocuments('app', 'followed_units', [
        Query.equal('user_id', profile.$id),
      ]);
      
      if (response.documents.length > 0) {
        await databases.deleteDocument('app', 'followed_units', response.documents[0].$id);
      } else {
        await databases.createDocument('app', 'followed_units', department.$id, {
          user_id: profile.$id,
          department_ids: [department.$id],
        });
      }
    } catch (error) {
      console.error('Error updating followed units:', error);
    }
  }, [profile?.$id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchCampus();
  }, [fetchCampus]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const updateProfile = useCallback(async (profileData: Partial<Profile>) => {
    if (!data?.$id) return;

    try {
      const response = await databases.updateDocument('app', 'user', data.$id, profileData);
      setProfile(response as Profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [data?.$id]);

  const updateName = useCallback(async (name: string) => {
    try {
      const response = await updateUserName(name);
      setData(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  const updateUserPrefs = useCallback(async (key: string, value: any) => {
    try {
      const currentPrefs = await getUserPreferences();
      const updatedPrefs = { ...currentPrefs, [key]: value };
      const response = await updateUserPreferences(updatedPrefs);
      console.log('Preferences successfully updated', response);
    } catch (err: unknown) {
      console.error('Error updating preferences', err);
    }
  }, []);

  const addStudentId = useCallback(async (studentId: string) => {
    if (!data?.$id) throw new Error('User not found');

    try {
      const newStudentId = await databases.createDocument('app', 'student_id', studentId, {
        student_id: studentId,
      });
      if (newStudentId.$id) {
        setStudentId(newStudentId.$id);
        await updateDocument('user', data.$id, { student_id: newStudentId.$id, studentId: newStudentId.$id });
        setError(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStudentId(null);
    }
  }, [data?.$id]);


  useEffect(() => {
    async function fetchBisoMembership() {
      if (studentId) {
        const body = {
          snumber: studentId
        }
        const execution = await functions.createExecution('verify_biso_membership', studentId, false);
        console.log("This is execution: ", execution.responseBody);
        // Parse and extract just the nested membership object
        const response = JSON.parse(execution.responseBody);
        setMembership(response.membership);
      }
    }
    fetchBisoMembership();
  }, [studentId]);

  useEffect(() => {
    const fetchFollowedDepartments = async () => {
      if (!profile?.$id) return;
      
      try {
        const response = await databases.listDocuments('app', 'followed_units', [
          Query.equal('user_id', profile.$id),
        ]);
        
        if (response.documents.length > 0) {
          const departmentIds = response.documents[0].department_ids || [];
          
          // Fetch department details
          const departmentsResponse = await databases.listDocuments('app', 'departments', [
            Query.equal('$id', departmentIds),
          ]);
          
          setFollowedDepartments(departmentsResponse.documents);
        }
      } catch (error) {
        console.error('Error fetching followed departments:', error);
      }
    };

    fetchFollowedDepartments();
  }, [profile?.$id]);

  const refetchUser = useCallback(fetchAccount, [fetchAccount]);

  const contextValue = useMemo(() => ({
    data,
    profile,
    isLoading,
    setIsLoading,
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
    userDepartment,
    membership,
    followedDepartments,
    onToggleDepartmentFollow,
    setProfile
  }), [
    data, profile, isLoading, error, membershipExpiry, isBisoMember, studentId, setProfile,
    userCampus, userDepartment, refetchUser, updateName, updateUserPrefs, updateProfile, addStudentId, membership
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
