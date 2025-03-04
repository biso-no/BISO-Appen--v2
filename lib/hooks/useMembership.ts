import { useQuery } from '@tanstack/react-query';
import { functions } from '@/lib/appwrite';

interface Membership {
  membership_id: string;
  name: string;
  price: number;
  category: string;
  status: boolean;
  expiryDate: string;
  $id: string;
}

export function useMembership(studentId: string | null | undefined) {
  return useQuery({
    queryKey: ['membership', studentId],
    queryFn: async () => {
      const execution = await functions.createExecution('verify_biso_membership', studentId!, false);
      const response = JSON.parse(execution.responseBody);
      return response.membership as Membership || null;
    },
    enabled: !!studentId,
  });
} 