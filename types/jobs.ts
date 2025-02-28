// Define possible campus locations
export type Campus = 'Oslo' | 'Bergen' | 'Stavanger' | 'Trondheim' | 'National';

// Define possible languages
export type Language = 'no' | 'en';

// Interface for job data
export interface Job {
  // Basic job information
  id: number;
  title: string;
  campus: Campus[];
  deadline: string;
  description: string;
  contact: string;
  language: Language;
  
  // Job requirements and details
  responsibilities: string[];
  qualities: string[];
  
  // Optional fields
  expiry_date?: string;
  url?: string;
}

// Interface for API response when fetching jobs
export interface JobsApiResponse {
  jobs: Job[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Interface for job filter state
export interface JobFilters {
  searchTerm: string;
  selectedCampus: Campus | 'All';
  selectedLanguage: Language | 'All';
}

// Interface for job sorting options
export interface JobSortOptions {
  sortBy: 'title' | 'deadline' | 'campus';
  sortDirection: 'asc' | 'desc';
}
