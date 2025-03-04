import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIPreferencesState {
  // Appearance
  fontSize: 'small' | 'medium' | 'large';
  reduceAnimations: boolean;
  highContrastMode: boolean;
  
  // Home screen
  homeLayout: 'grid' | 'list' | 'compact';
  homeSortOrder: 'recent' | 'alphabetical';
  
  // Lists
  listDensity: 'compact' | 'comfortable' | 'spacious';
  showThumbnails: boolean;
  
  // Notifications
  notificationsEnabled: boolean;
  notificationSoundEnabled: boolean;
  notificationVibrationEnabled: boolean;
  
  // Actions
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setReduceAnimations: (reduce: boolean) => void;
  setHighContrastMode: (enabled: boolean) => void;
  setHomeLayout: (layout: 'grid' | 'list' | 'compact') => void;
  setHomeSortOrder: (order: 'recent' | 'alphabetical') => void;
  setListDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  setShowThumbnails: (show: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationSoundEnabled: (enabled: boolean) => void;
  setNotificationVibrationEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

// Default preferences
const defaultPreferences = {
  fontSize: 'medium' as const,
  reduceAnimations: false,
  highContrastMode: false,
  homeLayout: 'grid' as const,
  homeSortOrder: 'recent' as const,
  listDensity: 'comfortable' as const,
  showThumbnails: true,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  notificationVibrationEnabled: true,
};

// Create persisted store that saves to AsyncStorage
export const useUIPreferencesStore = create<UIPreferencesState>()(
  immer(
    persist(
      (set) => ({
        ...defaultPreferences,
        
        // Actions
        setFontSize: (fontSize) => set(state => {
          state.fontSize = fontSize;
        }),
        
        setReduceAnimations: (reduceAnimations) => set(state => {
          state.reduceAnimations = reduceAnimations;
        }),
        
        setHighContrastMode: (highContrastMode) => set(state => {
          state.highContrastMode = highContrastMode;
        }),
        
        setHomeLayout: (homeLayout) => set(state => {
          state.homeLayout = homeLayout;
        }),
        
        setHomeSortOrder: (homeSortOrder) => set(state => {
          state.homeSortOrder = homeSortOrder;
        }),
        
        setListDensity: (listDensity) => set(state => {
          state.listDensity = listDensity;
        }),
        
        setShowThumbnails: (showThumbnails) => set(state => {
          state.showThumbnails = showThumbnails;
        }),
        
        setNotificationsEnabled: (notificationsEnabled) => set(state => {
          state.notificationsEnabled = notificationsEnabled;
          
          // If notifications are disabled, disable sound and vibration too
          if (!notificationsEnabled) {
            state.notificationSoundEnabled = false;
            state.notificationVibrationEnabled = false;
          }
        }),
        
        setNotificationSoundEnabled: (notificationSoundEnabled) => set(state => {
          state.notificationSoundEnabled = notificationSoundEnabled;
        }),
        
        setNotificationVibrationEnabled: (notificationVibrationEnabled) => set(state => {
          state.notificationVibrationEnabled = notificationVibrationEnabled;
        }),
        
        resetToDefaults: () => set(() => defaultPreferences),
      }),
      {
        name: 'ui-preferences',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
); 