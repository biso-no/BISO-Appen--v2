import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AICopilotContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  openAICopilot: () => void;
  closeAICopilot: () => void;
  toggleAICopilot: () => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

interface AICopilotProviderProps {
  children: ReactNode;
}

export function AICopilotProvider({ children }: AICopilotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openAICopilot = () => setIsOpen(true);
  const closeAICopilot = () => setIsOpen(false);
  const toggleAICopilot = () => setIsOpen(prev => !prev);

  return (
    <AICopilotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openAICopilot,
        closeAICopilot,
        toggleAICopilot,
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