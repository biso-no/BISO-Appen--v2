import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface CopilotState {
  // UI state
  isExpanded: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  currentAnimation: 'idle' | 'thinking' | 'speaking' | 'listening' | 'waving';
  
  // Suggestions shown to the user
  suggestions: string[];
  
  // UI Actions
  expandCopilot: () => void;
  minimizeCopilot: () => void;
  toggleMinimized: () => void;
  
  // Animation control
  setAnimation: (animation: CopilotState['currentAnimation']) => void;
  
  // Suggestions
  setSuggestions: (suggestions: string[]) => void;
}

export const useCopilotStore = create<CopilotState>()(
  immer((set, get) => ({
    // Initial UI state
    isExpanded: false,
    isMinimized: false,
    isLoading: false,
    currentAnimation: 'idle',
    
    // Initial suggestions
    suggestions: [
      'Help me decide what unit to join',
      'Can you suggest me any available roles based on my skills?',
      'I have questions regarding the local laws on Campus',
      'I would like to submit a feature request',
      'I need to report a bug'
    ],
    
    // UI Actions
    expandCopilot: () => set({ isExpanded: true, isMinimized: false }),
    minimizeCopilot: () => set({ isExpanded: false }),
    toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
    
    // Animation control
    setAnimation: (animation) => set({ currentAnimation: animation }),
    
    // Suggestions
    setSuggestions: (suggestions) => set({ suggestions }),
  }))
); 