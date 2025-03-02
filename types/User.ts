// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  role?: 'user' | 'admin' | 'moderator';
  preferences?: UserPreferences;
  isVerified?: boolean;
}

// User preferences type
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailUpdates?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any; // Allow for additional custom preferences
} 