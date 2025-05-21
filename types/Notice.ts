import { Models } from 'react-native-appwrite';

export interface Notice extends Models.Document {
  title: string;
  description: string;
  color?: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  locale: 'norwegian' | 'english';
}

export interface NoticeState {
  dismissedNotices: string[]; // Array of notice IDs that the user has dismissed
} 