import { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/auth-provider';
import { getSavedJobs as getSavedJobsApi, saveJob as saveJobApi, unsaveJob as unsaveJobApi } from '@/lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobPosition, SavedJob } from '@/types/job';

const SAVED_JOBS_KEY = '@biso/saved_jobs';

export function useSavedJobs() {
  const { data: user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved jobs from both local storage and Appwrite
  useEffect(() => {
    async function loadSavedJobs() {
      try {
        // Load from local storage first for immediate display
        const localData = await AsyncStorage.getItem(SAVED_JOBS_KEY);
        if (localData) {
          setSavedJobs(JSON.parse(localData));
        }

        // If user is logged in, sync with Appwrite
        if (user) {
          const appwriteJobs = await getSavedJobsApi();
          const formattedJobs = appwriteJobs.map(doc => ({
            jobId: doc.jobId,
            savedAt: doc.savedAt,
            title: doc.title,
            campus: doc.campus,
          }));

          // Merge local and Appwrite data
          const mergedJobs = [...new Map([
            ...savedJobs,
            ...formattedJobs
          ].map(job => [job.jobId, job])).values()];

          setSavedJobs(mergedJobs);
          await AsyncStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(mergedJobs));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved jobs');
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedJobs();
  }, [user]);

  const saveJob = async (job: JobPosition) => {
    try {
      const newSavedJob: SavedJob = {
        jobId: job.id,
        savedAt: new Date().toISOString(),
        title: job.title,
        campus: job.campus,
      };

      // Update local state and storage
      const updatedJobs = [...savedJobs, newSavedJob];
      setSavedJobs(updatedJobs);
      await AsyncStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedJobs));

      // If user is logged in, save to Appwrite
      if (user) {
        await saveJobApi(user.$id, {
          jobId: job.id,
          title: job.title,
          campus: job.campus,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
      throw err;
    }
  };

  const unsaveJob = async (jobId: number) => {
    try {
      // Update local state and storage
      const updatedJobs = savedJobs.filter(job => job.jobId !== jobId);
      setSavedJobs(updatedJobs);
      await AsyncStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedJobs));

      // If user is logged in, remove from Appwrite
      if (user) {
        await unsaveJobApi(user.$id, jobId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsave job');
      throw err;
    }
  };

  const isJobSaved = (jobId: number) => {
    return savedJobs.some(job => job.jobId === jobId);
  };

  return {
    savedJobs,
    isLoading,
    error,
    saveJob,
    unsaveJob,
    isJobSaved,
  };
} 