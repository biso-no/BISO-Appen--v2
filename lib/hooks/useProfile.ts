import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocument, updateDocument } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

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

interface UpdateProfileVariables {
  userId: string;
  data: Partial<Profile>;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getDocument('user', userId!) as Promise<Profile>,
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateProfileVariables) =>
      updateDocument('user', userId, data) as Promise<Profile>,
    onSuccess: (data: Profile, variables: UpdateProfileVariables) => {
      queryClient.setQueryData(['profile', variables.userId], data);
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}

export function useStudentId(userId: string | undefined) {
  return useQuery({
    queryKey: ['studentId', userId],
    queryFn: async () => {
      const response = await getDocument('student_id', userId!);
      return response.student_id as string;
    },
    enabled: !!userId,
  });
} 