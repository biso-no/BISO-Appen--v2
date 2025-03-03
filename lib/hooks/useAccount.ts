import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccount, updateUserName } from '@/lib/appwrite';

export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: getAccount,
  });
}

export function useUpdateName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserName,
    onSuccess: (data) => {
      queryClient.setQueryData(['account'], data);
    },
  });
} 