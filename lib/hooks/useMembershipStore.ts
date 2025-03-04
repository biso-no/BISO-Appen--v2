import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { functions } from '@/lib/appwrite';
import { useMembershipStore } from '@/lib/stores/membershipStore';
import { useZustandProfile } from './useProfileStore';

interface Membership {
  membership_id: string;
  name: string;
  price: number;
  category: string;
  status: boolean;
  expiryDate: string;
  $id: string;
}

/**
 * Hook to sync React Query membership data with Zustand store
 */
export function useZustandMembership() {
  // Get profile to access studentId
  const { profile } = useZustandProfile();
  const studentId = profile?.student_id;
  
  // Get state and actions from the Zustand store
  const { 
    membership, 
    isLoading: storeLoading,
    isBisoMember,
    membershipExpiry,
    setMembership, 
    setLoading, 
    setError
  } = useMembershipStore();
  
  // Use React Query to fetch the membership data
  const { 
    data: membershipData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['membership', studentId],
    queryFn: async () => {
      const execution = await functions.createExecution('verify_biso_membership', studentId!, false);
      const response = JSON.parse(execution.responseBody);
      return response.membership as Membership;
    },
    enabled: !!studentId,
  });
  
  // Update the Zustand store when React Query data changes
  useEffect(() => {
    if (membershipData) {
      setMembership(membershipData);
    }
  }, [membershipData, setMembership]);
  
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
    membership,
    isLoading: storeLoading || queryLoading,
    isBisoMember,
    membershipExpiry,
    refetch
  };
} 