import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPreferences, updateUserPreferences } from '@/lib/appwrite';

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: getUserPreferences,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const currentPrefs = await getUserPreferences();
      const updatedPrefs = { ...currentPrefs, [key]: value };
      return updateUserPreferences(updatedPrefs);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
    },
  });
} 