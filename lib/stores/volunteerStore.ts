import { create } from 'zustand';
import { Models } from 'react-native-appwrite';

export interface VolunteerFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedInterests: string[];
}

export type JobCategory = {
  id: string;
  name: string;
  icon: any;
  color: string;
  frequency?: number;
};

interface VolunteerStoreState {
  // Jobs data
  jobs: Models.Document[];
  categories: JobCategory[];
  interests: string[];
  
  // Pagination and loading states
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Filter states
  filters: VolunteerFilters;
  
  // UI states
  showAllCategories: boolean;
  showAllInterests: boolean;
  showAllCategoriesInSheet: boolean;
  isFilterOpen: boolean;
  
  // Actions
  setJobs: (jobs: Models.Document[]) => void;
  addJobs: (jobs: Models.Document[]) => void;
  setCategories: (categories: JobCategory[]) => void;
  setInterests: (interests: string[]) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsLoadingMore: (isLoadingMore: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  setFilters: (filters: Partial<VolunteerFilters>) => void;
  resetFilters: () => void;
  toggleFilterSheet: (isOpen?: boolean) => void;
  toggleShowAllCategories: (value?: boolean) => void;
  toggleShowAllInterests: (value?: boolean) => void;
  toggleShowAllCategoriesInSheet: (value?: boolean) => void;
  
  // Computed values
  getFilteredJobs: () => Models.Document[];
}

// Default categories for volunteer positions
const DEFAULT_CATEGORIES: JobCategory[] = [
  { id: 'all', name: 'All', icon: 'Users', color: 'blue' },
  { id: 'leadership', name: 'Leadership', icon: 'Rocket', color: 'purple' },
  { id: 'events', name: 'Events', icon: 'Calendar', color: 'orange' },
  { id: 'marketing', name: 'Marketing', icon: 'Sparkles', color: 'pink' },
  { id: 'tech', name: 'Tech', icon: 'Zap', color: 'green' },
];

export const useVolunteerStore = create<VolunteerStoreState>((set, get) => ({
  // Initial state
  jobs: [],
  categories: DEFAULT_CATEGORIES,
  interests: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  refreshing: false,
  filters: {
    searchQuery: '',
    selectedCategory: 'all',
    selectedInterests: [],
  },
  showAllCategories: false,
  showAllInterests: false, 
  showAllCategoriesInSheet: false,
  isFilterOpen: false,
  
  // Actions
  setJobs: (jobs) => set({ jobs }),
  addJobs: (newJobs) => set((state) => ({ jobs: [...state.jobs, ...newJobs] })),
  setCategories: (categories) => set({ categories }),
  setInterests: (interests) => set({ interests }),
  setPage: (page) => set({ page }),
  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setError: (error) => set({ error }),
  setRefreshing: (refreshing) => set({ refreshing }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set((state) => ({
    filters: {
      searchQuery: '',
      selectedCategory: 'all',
      selectedInterests: [],
    }
  })),
  
  toggleFilterSheet: (isOpen) => set((state) => ({
    isFilterOpen: isOpen !== undefined ? isOpen : !state.isFilterOpen
  })),
  
  toggleShowAllCategories: (value) => set((state) => ({
    showAllCategories: value !== undefined ? value : !state.showAllCategories
  })),
  
  toggleShowAllInterests: (value) => set((state) => ({
    showAllInterests: value !== undefined ? value : !state.showAllInterests
  })),
  
  toggleShowAllCategoriesInSheet: (value) => set((state) => ({
    showAllCategoriesInSheet: value !== undefined ? value : !state.showAllCategoriesInSheet
  })),
  
  // Computed values
  getFilteredJobs: () => {
    const { jobs, filters } = get();
    const { searchQuery, selectedCategory, selectedInterests } = filters;
    
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check if job matches selected category (type)
      const matchesCategory = selectedCategory === "all" || 
        (job.type && Array.isArray(job.type) && 
          job.type.some(type => type.toLowerCase() === selectedCategory.toLowerCase()));
      
      // Check if job matches selected interests (if any are selected)
      const matchesInterests = selectedInterests.length === 0 ||
        (job.interests && Array.isArray(job.interests) &&
          selectedInterests.some(interest => 
            job.interests.some((jobInterest: string) => 
              jobInterest.toLowerCase() === interest.toLowerCase()
            )
          ));
      
      return matchesSearch && matchesCategory && matchesInterests;
    });
  }
})); 