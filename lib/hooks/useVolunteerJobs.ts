import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Models } from 'react-native-appwrite';
import { useEffect, useMemo } from 'react';
import { useVolunteerStore } from '../stores/volunteerStore';

const ITEMS_PER_PAGE = 15;

// Helper function to extract categories and interests from job data
export function extractCategoriesAndInterests(jobData: Models.Document[]) {
  if (!jobData || jobData.length === 0) return { categories: [], interests: [] };
  
  // Extract types (categories) with frequency count
  const typesCount: Record<string, number> = {};
  jobData.forEach(job => {
    if (job.type && Array.isArray(job.type)) {
      job.type.forEach(type => {
        typesCount[type] = (typesCount[type] || 0) + 1;
      });
    }
  });

  // Extract interests with frequency count
  const interestsCount: Record<string, number> = {};
  jobData.forEach(job => {
    if (job.interests && Array.isArray(job.interests)) {
      job.interests.forEach(interest => {
        interestsCount[interest] = (interestsCount[interest] || 0) + 1;
      });
    }
  });

  const sortedTypes = Object.keys(typesCount).sort((a, b) => typesCount[b] - typesCount[a]);
  const sortedInterests = Object.keys(interestsCount).sort((a, b) => interestsCount[b] - interestsCount[a]);
  
  // Map types to category objects with icons
  const icons = ['Users', 'Rocket', 'Calendar', 'Sparkles', 'Zap', 'Briefcase', 'Heart', 'Star'];
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow', 'red', 'cyan'];
  
  const typeCategories = sortedTypes.map((type, index) => ({
    id: type.toLowerCase(),
    name: type,
    icon: icons[index % icons.length],
    color: colors[index % colors.length],
    frequency: typesCount[type]
  }));
  
  // Add "All" category at the beginning
  typeCategories.unshift({
    id: 'all',
    name: 'All',
    icon: 'Users',
    color: 'blue',
    frequency: jobData.length
  });
  
  return {
    categories: typeCategories,
    interests: sortedInterests
  };
}

interface FetchJobsParams {
  campus: string | null | undefined;
  pageParam?: number;
}

// Function to fetch jobs from the API
async function fetchJobs({ campus, pageParam = 1 }: FetchJobsParams) {
  const apiUrl = `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=${ITEMS_PER_PAGE}&page=${pageParam}&campus=${campus || ''}`;
  
  const response = await axios.get(apiUrl);
  
  // Check if response.data is an array
  if (!Array.isArray(response.data)) {
    throw new Error("Invalid API response format");
  }
  
  return {
    data: response.data,
    nextPage: response.data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
    totalPages: pageParam
  };
}

export function useVolunteerJobs(campus: string | null | undefined) {
  const { 
    setJobs, 
    setCategories, 
    setInterests, 
    setIsLoading, 
    setError,
    setHasMore,
    setRefreshing
  } = useVolunteerStore();

  // Use React Query's useInfiniteQuery for paginated data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: ['volunteerJobs', campus],
    queryFn: ({ pageParam }) => fetchJobs({ campus, pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten pages data into a single array of jobs
  const jobs = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  // Extract metadata from jobs
  useEffect(() => {
    if (jobs.length > 0) {
      const { categories, interests } = extractCategoriesAndInterests(jobs);
      setJobs(jobs);
      setCategories(categories.length > 1 ? categories : []);
      setInterests(interests);
      setHasMore(!!hasNextPage);
    }
  }, [jobs, hasNextPage, setJobs, setCategories, setInterests, setHasMore]);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isLoading);
    setRefreshing(isRefetching);
  }, [isLoading, isRefetching, setIsLoading, setRefreshing]);

  // Sync error state
  useEffect(() => {
    if (isError) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching jobs');
    } else {
      setError(null);
    }
  }, [isError, error, setError]);

  return {
    jobs,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch
  };
} 