import React from 'react';
import { Button } from 'tamagui';
import { Bot } from '@tamagui/lucide-icons';
import { useAICopilot } from './context/core/ai-copilot-provider';
import { AICopilotModal } from './modals/ai-copilot-modal';

interface AICopilotButtonProps {
  size?: number;
}

export function AICopilotButton({ size = 24 }: AICopilotButtonProps) {
  const { openAICopilot, isEnabled } = useAICopilot();

  // Don't render the button if the feature is disabled
  if (!isEnabled) return null;

  return (
    <Button
      size="$3"
      circular
      icon={<Bot size={size} />}
      onPress={openAICopilot}
      backgroundColor="$blue9"
      pressStyle={{ scale: 0.9, opacity: 0.8 }}
      animation="quick"
    />
  );
}

export function AICopilotContainer() {
  const { isOpen, setIsOpen, isEnabled } = useAICopilot();

  // Don't render the container if the feature is disabled
  if (!isEnabled) return null;

  const handleSetOpen = (open: boolean) => {
    if (open === false) {
      setIsOpen(false);
    }
  };

  return (
    <AICopilotModal open={isOpen} setOpen={handleSetOpen} />
  );
} 