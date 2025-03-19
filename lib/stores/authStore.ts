import { create } from 'zustand';
import { Models } from 'react-native-appwrite';
import { updateUserName, updateUserPreferences, getUserPreferences } from '@/lib/appwrite';
import { queryClient } from '@/lib/react-query';
import { setupPushNotifications } from '@/lib/notifications';

// Define the auth store state interface
interface AuthState {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  error: string | null;
  pushNotificationsInitialized: boolean;
  
  // Actions
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Operations
  updateName: (name: string) => Promise<void>;
  updatePreferences: (key: string, value: any, preventNavigation?: boolean) => Promise<void>;
  resetState: () => void;
}

// Initial state values
const initialState = {
  user: null,
  isLoading: false,
  error: null,
  pushNotificationsInitialized: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  
  // State setters
  setUser: (user) => {
    set({ user });
    
    // Register for push notifications when a user logs in, but only once per session
    const state = get();
    if (user && user.$id && !state.pushNotificationsInitialized) {
      setupPushNotifications(user.$id)
        .then(() => {
          set({ pushNotificationsInitialized: true });
        })
        .catch(error => {
          console.error('Failed to setup push notifications:', error);
        });
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Operations
  updateName: async (name) => {
    try {
      set({ isLoading: true, error: null });
      // Using the same function that was used in the mutation
      const user = await updateUserName(name);
      set({ user, isLoading: false });
      // Invalidate queries that might depend on user name
      queryClient.invalidateQueries({ queryKey: ['account'] });
    } catch (err: unknown) {
      set({ 
        error: err instanceof Error ? err.message : 'An unknown error occurred', 
        isLoading: false 
      });
      throw err;
    }
  },
  
  updatePreferences: async (key, value, preventNavigation = false) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current preferences
      const currentPrefs = await getUserPreferences();
      
      // Update the specific preference
      const updatedPrefs = { 
        ...currentPrefs, 
        [key]: value 
      };
      
      // Update preferences in Appwrite
      const updatedUser = await updateUserPreferences(updatedPrefs);
      
      // Update the user in the store
      set({ user: updatedUser, isLoading: false });
      
      // Invalidate queries that might depend on user preferences
      // Skip invalidation if preventNavigation is true to avoid re-renders
      if (!preventNavigation) {
        queryClient.invalidateQueries({ queryKey: ['account'] });
        queryClient.invalidateQueries({ queryKey: ['preferences'] });
      }
    } catch (err: unknown) {
      set({ 
        error: err instanceof Error ? err.message : 'An unknown error occurred', 
        isLoading: false 
      });
      throw err;
    }
  },
  
  resetState: () => set(initialState),
})); 