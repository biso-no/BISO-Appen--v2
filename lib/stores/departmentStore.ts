import { create } from 'zustand';
import { Models, Query } from 'react-native-appwrite';
import { databases } from '@/lib/appwrite';

interface DepartmentState {
  // State
  userDepartment: Models.Document | null;
  followedDepartments: Models.Document[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserDepartment: (department: Models.Document) => void;
  setFollowedDepartments: (departments: Models.Document[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDepartmentFollow: (userId: string | undefined, department: Models.Document) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  // Initial state
  userDepartment: null,
  followedDepartments: [],
  isLoading: false,
  error: null,
  
  // Actions
  setUserDepartment: (department) => set({ userDepartment: department }),
  
  setFollowedDepartments: (departments) => set({ followedDepartments: departments }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  toggleDepartmentFollow: async (userId, department) => {
    if (!userId) return;
    
    try {
      // Get current followed departments
      const { followedDepartments } = get();
      
      // Check if already following
      const isFollowing = followedDepartments.some(
        (dep) => dep.$id === department.$id
      );
      
      // Find existing document for user's followed departments
      const followedResponse = await databases.listDocuments(
        'app', 
        'followed_units', 
        [Query.equal('user_id', userId)]
      );
      
      const followedDoc = followedResponse.documents[0];
      
      // Update followed departments list
      let updatedFollowDepartments: Models.Document[];
      
      if (isFollowing) {
        // Remove department from followed list
        updatedFollowDepartments = followedDepartments.filter(
          (dep) => dep.$id !== department.$id
        );
      } else {
        // Add department to followed list
        updatedFollowDepartments = [...followedDepartments, department];
      }
      
      // Update the database
      if (followedDoc) {
        // Extract department IDs
        const departmentIds = updatedFollowDepartments.map(dep => dep.$id);
        
        // Update existing document
        await databases.updateDocument(
          'app',
          'followed_units',
          followedDoc.$id,
          { department_ids: departmentIds }
        );
      } else {
        // Create new document
        await databases.createDocument(
          'app',
          'followed_units',
          'unique()',
          { 
            user_id: userId,
            department_ids: [department.$id]
          }
        );
      }
      
      // Update local state
      set({ followedDepartments: updatedFollowDepartments });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle department follow'
      });
    }
  },
})); 