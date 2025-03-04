import { create } from 'zustand';
import { Models } from 'react-native-appwrite';
import { updateDocument, databases } from '@/lib/appwrite';
import { queryClient } from '@/lib/react-query';

// Define the Profile interface
interface Profile extends Models.Document {
  name?: string;
  studentId?: Models.Document | string;
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

// Define the profile store state
interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Operations
  updateProfile: (userId: string | undefined, profileData: Partial<Profile>) => Promise<void>;
  addStudentId: (userId: string | undefined, studentId: string) => Promise<void>;
  resetState: () => void;
}

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Create the store
export const useProfileStore = create<ProfileState>((set, get) => ({
  ...initialState,
  
  // State setters
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Operations
  updateProfile: async (userId, profileData) => {
    if (!userId) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Update profile in the database
      const updatedProfile = await databases.updateDocument('app', 'user', userId, profileData);
      
      // Update local state
      set({ 
        profile: { ...get().profile, ...updatedProfile } as Profile, 
        isLoading: false 
      });
      
      // Invalidate queries that might depend on profile
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An unknown error occurred', 
        isLoading: false 
      });
      throw err;
    }
  },
  
  addStudentId: async (userId, studentId) => {
    if (!userId) throw new Error('User not found');
    
    try {
      set({ isLoading: true, error: null });
      
      // Create student ID document
      const newStudentId = await databases.createDocument('app', 'student_id', studentId, {
        student_id: studentId,
      });
      
      if (newStudentId.$id) {
        // Update user document with student ID reference
        await updateDocument('user', userId, { 
          student_id: newStudentId.$id, 
          studentId: newStudentId.$id 
        });
        
        // Update local state
        set({ 
          profile: { 
            ...get().profile, 
            student_id: newStudentId.$id,
            studentId: newStudentId.$id
          } as Profile, 
          isLoading: false 
        });
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['studentId', userId] });
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An unknown error occurred', 
        isLoading: false 
      });
      throw err;
    }
  },
  
  resetState: () => set(initialState),
})); 