import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notice, NoticeState } from '../../types/Notice';
import { getActiveNotices } from '../appwrite';

interface NoticeStore extends NoticeState {
  notices: Notice[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotices: (notices: Notice[]) => void;
  dismissNotice: (noticeId: string) => void;
  fetchNotices: (locale: 'norwegian' | 'english') => Promise<void>;
  resetDismissedNotices: () => void;
}

export const useNoticeStore = create<NoticeStore>()(
  persist(
    (set, get) => ({
      notices: [],
      dismissedNotices: [],
      isLoading: false,
      error: null,
      
      setNotices: (notices) => set({ notices }),
      
      dismissNotice: (noticeId) => {
        set((state) => ({
          dismissedNotices: [...state.dismissedNotices, noticeId]
        }));
      },
      
      fetchNotices: async (locale) => {
        try {
          set({ isLoading: true, error: null });
          const response = await getActiveNotices(locale);
          set({ notices: response.documents as Notice[], isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Failed to fetch notices', 
            isLoading: false 
          });
        }
      },
      
      resetDismissedNotices: () => {
        set({ dismissedNotices: [] });
      }
    }),
    {
      name: 'notice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ dismissedNotices: state.dismissedNotices }),
    }
  )
); 