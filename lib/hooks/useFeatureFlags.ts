import { useQuery } from '@tanstack/react-query';
import { databases } from '../appwrite';
import { useEffect, useState } from 'react';

// Define the feature flag interface based on your Appwrite collection
interface FeatureFlag {
  $id: string;
  key: string;
  enabled: boolean;
  title: string;
  description: string;
}

interface FeatureFlagsState {
  [key: string]: boolean;
}

// Feature flag keys - add new flags here
export enum FeatureFlagKey {
  AI_COPILOT = 'ai_copilot',
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlagsState>({});
  
  // Fetch feature flags from Appwrite
  const { data, isLoading, error } = useQuery({
    queryKey: ['feature_flags'],
    queryFn: async () => {
      const response = await databases.listDocuments(
        'app',
        'feature_flags',
      );
      return response.documents as unknown as FeatureFlag[];
    },
    // Cache feature flags for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Process feature flags when data is loaded
  useEffect(() => {
    if (data) {
      const flagsMap: FeatureFlagsState = {};
      data.forEach((flag: FeatureFlag) => {
        flagsMap[flag.key] = flag.enabled;
      });
      setFlags(flagsMap);
    }
  }, [data]);

  // Check if a specific feature flag is enabled
  const isEnabled = (key: FeatureFlagKey): boolean => {
    return flags[key] === true;
  };

  return {
    flags,
    isEnabled,
    isLoading,
    error,
  };
} 