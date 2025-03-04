import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '@/components/context/core/profile-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CampusContextType {
  campuses: Models.Document[] | null;
  currentCampus: Models.Document | null;
  isLoading: boolean;
  error: string | null;
  changeCampus: (campus: Models.Document) => Promise<void>;
  refreshCampuses: () => Promise<void>;
}

type PartialCampus = {
  $id: string;
  name: string;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

// React Query keys
const CAMPUS_QUERY_KEY = 'campuses';

// Function to fetch campuses from API
async function fetchCampusesFromAPI() {
  const data = await databases.listDocuments('app', 'campus', [
    Query.select(['name', '$id']),
  ]);
  return data.documents;
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [currentCampus, setCurrentCampus] = useState<Models.Document | null>(null);
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  // Use React Query for caching and automatic refetching
  const { 
    data: campuses, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [CAMPUS_QUERY_KEY],
    queryFn: fetchCampusesFromAPI,
    staleTime: 1000 * 60 * 30, // Consider campuses fresh for 30 minutes
    refetchOnWindowFocus: false,
  });

  const changeCampus = useCallback(async (campus: Models.Document) => {
    try {
      setCurrentCampus(campus);
      
      // Persist to AsyncStorage for compatibility with old implementation
      const campusData: PartialCampus = {
        $id: campus.$id,
        name: campus.name
      };
      await AsyncStorage.default.setItem('campus', JSON.stringify(campusData));
    } catch (err) {
      console.error('Failed to update campus', err);
      throw err;
    }
  }, []);

  // Refresh campuses function for manual refresh
  const refreshCampuses = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [CAMPUS_QUERY_KEY] });
  }, [queryClient]);

  // Initialize campus from storage or profile
  useEffect(() => {
    const initializeCampus = async () => {
      if (!campuses) return;
      
      // First try to load from AsyncStorage
      try {
        const storedCampus = await AsyncStorage.default.getItem('campus');
        if (storedCampus) {
          const campusData = JSON.parse(storedCampus);
          // Find the matching campus in our fetched campuses
          const matchingCampus = campuses.find(c => c.$id === campusData.$id);
          if (matchingCampus) {
            setCurrentCampus(matchingCampus);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading campus from storage:', error);
      }

      // If no campus in storage, try from profile
      if (profile?.campus && typeof profile.campus === 'object') {
        setCurrentCampus(profile.campus as Models.Document);
      } else if (campuses && campuses.length > 0) {
        // Default to first campus
        setCurrentCampus(campuses[0]);
      }
    };

    initializeCampus();
  }, [campuses, profile]);

  const value = {
    campuses: campuses || null,
    currentCampus,
    isLoading,
    error: error ? String(error) : null,
    changeCampus,
    refreshCampuses
  };

  return (
    <CampusContext.Provider value={value}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampusContext() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampusContext must be used within a CampusProvider');
  }
  return context;
} 