import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccount } from '@/lib/appwrite';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Hook to sync React Query data with Zustand store
 * This provides a clean integration between server state and client state
 */
export function useAuth() {
  // Get state and actions from the Zustand store
  const { 
    user, 
    isLoading: storeLoading, 
    error, 
    setUser, 
    setLoading, 
    setError,
    updateName,
    updatePreferences,
    resetState
  } = useAuthStore();
  
  // Use React Query to fetch the user data
  const { 
    data: userData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['account'],
    queryFn: getAccount,
    // Don't refetch on window focus to prevent unnecessary fetches
    refetchOnWindowFocus: false,
  });
  
  // Update the Zustand store when React Query data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);
  
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
  
  // Return both the store state and the refetch function from React Query
  return {
    user,
    isLoading: storeLoading || queryLoading,
    error,
    actions: {
      updateName,
      updatePreferences,
      resetState,
      refetch
    }
  };
} 