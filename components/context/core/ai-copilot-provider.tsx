import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useFeatureFlags, FeatureFlagKey } from '@/lib/hooks/useFeatureFlags';

interface AICopilotContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  openAICopilot: () => void;
  closeAICopilot: () => void;
  toggleAICopilot: () => void;
  isEnabled: boolean;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

interface AICopilotProviderProps {
  children: ReactNode;
}

export function AICopilotProvider({ children }: AICopilotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnabled: isFeatureEnabled } = useFeatureFlags();
  const isAICopilotEnabled = isFeatureEnabled(FeatureFlagKey.AI_COPILOT);

  // Close AI Copilot if the feature is disabled
  useEffect(() => {
    if (!isAICopilotEnabled && isOpen) {
      setIsOpen(false);
    }
  }, [isAICopilotEnabled, isOpen]);

  const openAICopilot = () => {
    if (isAICopilotEnabled) {
      setIsOpen(true);
    }
  };
  
  const closeAICopilot = () => setIsOpen(false);
  
  const toggleAICopilot = () => {
    if (isAICopilotEnabled) {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <AICopilotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openAICopilot,
        closeAICopilot,
        toggleAICopilot,
        isEnabled: isAICopilotEnabled,
      }}
    >
      {children}
    </AICopilotContext.Provider>
  );
}

export function useAICopilot() {
  const context = useContext(AICopilotContext);
  if (context === undefined) {
    throw new Error('useAICopilot must be used within an AICopilotProvider');
  }
  return context;
} 