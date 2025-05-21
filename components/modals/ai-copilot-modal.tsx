import React from 'react';
import { Sheet } from '@tamagui/sheet';
import { Bot } from '@tamagui/lucide-icons';
import { AICopilot } from '../ai-copilot';

interface AICopilotModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ open, setOpen }) => {
  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={setOpen}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$2" flex={1}>
        <AICopilot isModal />
      </Sheet.Frame>
    </Sheet>
  );
}; 