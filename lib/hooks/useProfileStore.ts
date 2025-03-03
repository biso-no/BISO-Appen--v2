import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocument } from '@/lib/appwrite';
import { useProfileStore } from '@/lib/stores/profileStore';
import { useAuth } from '@/lib/hooks/useAuthStore';

/**
 * Hook to sync React Query profile data with Zustand store
 */
export function useZustandProfile() {
  // Get the current authenticated user
  const { user } = useAuth();
  const userId = user?.$id;
  
  // Get state and actions from the Zustand store
  const { 
    profile, 
    isLoading: storeLoading, 
    setProfile, 
    setLoading, 
    setError,
    updateProfile,
    addStudentId
  } = useProfileStore();
  
  // Use React Query to fetch the profile data
  const { 
    data: profileData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getDocument('user', userId!) as Promise<any>,
    enabled: !!userId,
  });
  
  // Update the Zustand store when React Query data changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData, setProfile]);
  
  // Sync loading state
  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);
  
  // Sync error state
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'An unknown error occurred');
    }
  }, [queryError, setError]);
  
  // Return a simplified API that matches the original context
  return {
    profile,
    isLoading: storeLoading || queryLoading,
    actions: {
      updateProfile: (profileData: any) => updateProfile(userId, profileData),
      addStudentId: (studentId: string) => addStudentId(userId, studentId),
      refetch
    }
  };
} 