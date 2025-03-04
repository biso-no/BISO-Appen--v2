import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocument, databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';

export function useCampusData(campusId: string | undefined) {
  return useQuery({
    queryKey: ['campus', campusId],
    queryFn: () => getDocument('campus', campusId!) as Promise<Models.Document>,
    enabled: !!campusId,
  });
}

export function useDepartmentData(departmentId: string | undefined) {
  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => getDocument('department', departmentId!) as Promise<Models.Document>,
    enabled: !!departmentId,
  });
}

export function useFollowedDepartments(userId: string | undefined) {
  return useQuery({
    queryKey: ['followedDepartments', userId],
    queryFn: async () => {
      const response = await databases.listDocuments('app', 'followed_units', [
        Query.equal('user_id', userId!),
      ]);
      
      if (response.documents.length > 0) {
        const departmentIds = response.documents[0].department_ids || [];
        
        const departmentsResponse = await databases.listDocuments('app', 'departments', [
          Query.equal('$id', departmentIds),
        ]);
        
        return departmentsResponse.documents;
      }
      
      return [];
    },
    enabled: !!userId,
  });
}

export function useToggleDepartmentFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, departmentId }: { userId: string; departmentId: string }) => {
      const response = await databases.listDocuments('app', 'followed_units', [
        Query.equal('user_id', userId),
      ]);
      
      if (response.documents.length > 0) {
        await databases.deleteDocument('app', 'followed_units', response.documents[0].$id);
      } else {
        await databases.createDocument('app', 'followed_units', departmentId, {
          user_id: userId,
          department_ids: [departmentId],
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followedDepartments', variables.userId] });
    },
  });
} 