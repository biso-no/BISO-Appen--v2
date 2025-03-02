import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Models, Query } from 'react-native-appwrite';
import { getDocument, databases } from '@/lib/appwrite';
import { useDepartmentStore } from '@/lib/stores/departmentStore';
import { useZustandProfile } from './useProfileStore';

/**
 * Hook to sync React Query department data with Zustand store
 */
export function useZustandDepartment() {
  // Get profile to access user department and ID
  const { profile } = useZustandProfile();
  const userId = profile?.$id;
  const departmentId = profile?.departments_id?.[0];
  
  // Get state and actions from the Zustand store
  const { 
    userDepartment,
    followedDepartments,
    isLoading: storeLoading,
    error,
    setUserDepartment,
    setFollowedDepartments,
    setLoading,
    setError,
    toggleDepartmentFollow
  } = useDepartmentStore();
  
  // Use React Query to fetch the user's department
  const { 
    data: departmentData, 
    isLoading: departmentQueryLoading, 
    error: departmentQueryError
  } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => getDocument('department', departmentId!) as Promise<Models.Document>,
    enabled: !!departmentId,
  });
  
  // Use React Query to fetch followed departments
  const { 
    data: followedDepartmentsData, 
    isLoading: followedDepartmentsQueryLoading, 
    error: followedDepartmentsQueryError,
    refetch: refetchFollowedDepartments
  } = useQuery({
    queryKey: ['followedDepartments', userId],
    queryFn: async () => {
      const response = await databases.listDocuments('app', 'followed_units', [
        Query.equal('user_id', userId!),
      ]);
      
      if (response.documents.length > 0) {
        const departmentIds = response.documents[0].department_ids || [];
        
        if (departmentIds.length === 0) {
          return [];
        }
        
        const departmentsResponse = await databases.listDocuments('app', 'departments', [
          Query.equal('$id', departmentIds),
        ]);
        
        return departmentsResponse.documents;
      }
      
      return [];
    },
    enabled: !!userId,
  });
  
  // Update the Zustand store when React Query data changes
  useEffect(() => {
    if (departmentData) {
      setUserDepartment(departmentData);
    }
  }, [departmentData, setUserDepartment]);
  
  useEffect(() => {
    if (followedDepartmentsData) {
      setFollowedDepartments(followedDepartmentsData);
    }
  }, [followedDepartmentsData, setFollowedDepartments]);
  
  // Sync loading state
  useEffect(() => {
    setLoading(departmentQueryLoading || followedDepartmentsQueryLoading);
  }, [departmentQueryLoading, followedDepartmentsQueryLoading, setLoading]);
  
  // Sync error state
  useEffect(() => {
    const queryError = departmentQueryError || followedDepartmentsQueryError;
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'An unknown error occurred');
    }
  }, [departmentQueryError, followedDepartmentsQueryError, setError]);
  
  // Return a simplified API that matches the original context
  return {
    userDepartment,
    followedDepartments,
    isLoading: storeLoading || departmentQueryLoading || followedDepartmentsQueryLoading,
    actions: {
      toggleDepartmentFollow: (department: Models.Document) => toggleDepartmentFollow(userId, department),
      refetchFollowedDepartments
    }
  };
} 