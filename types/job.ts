export interface JobPosition {
  id: number;
  title: string;
  content: string;
  campus: string[];
  expiry_date: string;
  url: string;
}

export interface SavedJob {
  jobId: number;
  savedAt: string;
  title: string;
  campus: string[];
}

// Categories for filtering
export const JOB_CATEGORIES = {
  ALL: 'All',
  BOARD: 'Board',
  COMMITTEE: 'Committee',
  VOLUNTEER: 'Volunteer',
  STUDENT_ASSISTANT: 'Student Assistant',
  OTHER: 'Other',
} as const;

export type JobCategory = typeof JOB_CATEGORIES[keyof typeof JOB_CATEGORIES]; 