import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient, QueryStatus } from '@tanstack/react-query';

export type AnimationType = 
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'zoomIn'
  | 'zoomOut'
  | 'flip'
  | 'rotate'
  | 'bounce'
  | 'pulse';

export interface AnimationPreferences {
  reduceMotion: boolean;
  disableAnimations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableParallaxEffects: boolean;
  enableHapticFeedback: boolean;
  enableLoadingAnimations: boolean; // For React Query integration
}

export interface AnimationState {
  // Track currently running animations
  runningAnimations: Map<string, AnimationType>;
  animationCount: number;
  
  // Track loading states from React Query
  loadingQueries: Set<string>;
  
  // Animation preferences (persisted)
  preferences: AnimationPreferences;
  
  // Actions for animation tracking
  registerAnimation: (id: string, type: AnimationType) => void;
  unregisterAnimation: (id: string) => void;
  clearAllAnimations: () => void;
  
  // React Query integration
  registerLoadingQuery: (queryKey: string) => void;
  unregisterLoadingQuery: (queryKey: string) => void;
  isQueryLoading: (queryKey: string) => boolean;
  getLoadingQueriesCount: () => number;
  
  // Actions for animation preferences
  setReduceMotion: (reduceMotion: boolean) => void;
  setDisableAnimations: (disableAnimations: boolean) => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setEnableParallaxEffects: (enableParallaxEffects: boolean) => void;
  setEnableHapticFeedback: (enableHapticFeedback: boolean) => void;
  setEnableLoadingAnimations: (enableLoadingAnimations: boolean) => void;
  
  // Derived values
  getAnimationDuration: (baseMs: number) => number;
}

// Define a type for the persisted state
interface PersistedState {
  preferences: AnimationPreferences;
}

// Default animation preferences
const defaultPreferences: AnimationPreferences = {
  reduceMotion: false,
  disableAnimations: false,
  animationSpeed: 'normal',
  enableParallaxEffects: true,
  enableHapticFeedback: true,
  enableLoadingAnimations: true,
};

// Animation speed factors
const speedFactors = {
  slow: 1.5,
  normal: 1,
  fast: 0.7,
};

// Create the animation store with persistence for preferences
export const useAnimationStore = create<AnimationState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        runningAnimations: new Map(),
        animationCount: 0,
        loadingQueries: new Set(),
        preferences: { ...defaultPreferences },
        
        // Animation tracking actions
        registerAnimation: (id, type) => {
          set(state => {
            const newRunningAnimations = new Map(state.runningAnimations);
            newRunningAnimations.set(id, type);
            state.runningAnimations = newRunningAnimations;
            state.animationCount += 1;
          });
        },
        
        unregisterAnimation: (id) => {
          set(state => {
            if (!state.runningAnimations.has(id)) return;
            
            const newRunningAnimations = new Map(state.runningAnimations);
            newRunningAnimations.delete(id);
            state.runningAnimations = newRunningAnimations;
            state.animationCount = Math.max(0, state.animationCount - 1);
          });
        },
        
        clearAllAnimations: () => {
          set(state => {
            state.runningAnimations = new Map();
            state.animationCount = 0;
          });
        },
        
        // React Query integration
        registerLoadingQuery: (queryKey) => {
          set(state => {
            const newLoadingQueries = new Set(state.loadingQueries);
            newLoadingQueries.add(queryKey);
            state.loadingQueries = newLoadingQueries;
          });
        },
        
        unregisterLoadingQuery: (queryKey) => {
          set(state => {
            const newLoadingQueries = new Set(state.loadingQueries);
            newLoadingQueries.delete(queryKey);
            state.loadingQueries = newLoadingQueries;
          });
        },
        
        isQueryLoading: (queryKey) => {
          return get().loadingQueries.has(queryKey);
        },
        
        getLoadingQueriesCount: () => {
          return get().loadingQueries.size;
        },
        
        // Preference actions
        setReduceMotion: (reduceMotion) => {
          set(state => {
            state.preferences.reduceMotion = reduceMotion;
          });
        },
        
        setDisableAnimations: (disableAnimations) => {
          set(state => {
            state.preferences.disableAnimations = disableAnimations;
          });
        },
        
        setAnimationSpeed: (speed) => {
          set(state => {
            state.preferences.animationSpeed = speed;
          });
        },
        
        setEnableParallaxEffects: (enableParallaxEffects) => {
          set(state => {
            state.preferences.enableParallaxEffects = enableParallaxEffects;
          });
        },
        
        setEnableHapticFeedback: (enableHapticFeedback) => {
          set(state => {
            state.preferences.enableHapticFeedback = enableHapticFeedback;
          });
        },
        
        setEnableLoadingAnimations: (enableLoadingAnimations) => {
          set(state => {
            state.preferences.enableLoadingAnimations = enableLoadingAnimations;
          });
        },
        
        // Derive animation duration based on preferences
        getAnimationDuration: (baseMs) => {
          const { preferences } = get();
          
          // If animations are disabled, return 0 for instant transitions
          if (preferences.disableAnimations) return 0;
          
          // Apply appropriate speed factor
          const speedFactor = speedFactors[preferences.animationSpeed];
          
          // Apply reduced motion if enabled (reduce by 70%)
          const reductionFactor = preferences.reduceMotion ? 0.3 : 1;
          
          return baseMs * speedFactor * reductionFactor;
        }
      })),
      {
        name: 'animation-preferences',
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
        // Only persist the preferences object
        partialize: (state: AnimationState): PersistedState => ({ 
          preferences: state.preferences 
        }),
      }
    ),
    { name: 'animation-store' }
  )
);

// Hook to integrate animation store with React Query
export function useAnimatedQuery() {
  const queryClient = useQueryClient();
  const {
    registerLoadingQuery,
    unregisterLoadingQuery,
    preferences
  } = useAnimationStore();
  
  // Function to track a specific query's loading state
  const trackQueryLoading = (queryKey: unknown[]) => {
    if (!preferences.enableLoadingAnimations) return;
    
    const normalizedKey = queryKey.join('.');
    
    // Get query state
    const state = queryClient.getQueryState(queryKey);
    
    if (state?.fetchStatus === 'fetching') {
      registerLoadingQuery(normalizedKey);
    } else {
      unregisterLoadingQuery(normalizedKey);
    }
  };
  
  return {
    trackQueryLoading,
  };
} 