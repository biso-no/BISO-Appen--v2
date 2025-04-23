import React, { useEffect, useState } from 'react';
import { Button, useTheme } from 'tamagui';
import { Bot, Sparkles } from '@tamagui/lucide-icons';
import { useCopilotStore } from '@/lib/stores/copilotStore';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';
interface CopilotButtonProps {}

export function CopilotButton({}: CopilotButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();
  const [isPulsing, setIsPulsing] = useState(false);
  const { t } = useTranslation();
  const { 
    isExpanded,
    expandCopilot,
    currentAnimation,
    isLoading
  } = useCopilotStore();
  
  // Set up animation based on state
  useEffect(() => {
    setIsPulsing(isLoading || currentAnimation === 'thinking');
  }, [isLoading, currentAnimation]);
  
  return (
      <Button
        circular
        size="$3"
        backgroundColor={isLoading ? '$blue8' : 'transparent'}
        borderWidth={1}
        borderColor={isLoading ? '$blue8' : '$borderColor'}
        marginRight="$2"
        pressStyle={{ scale: 0.92 }}
        onPress={() => expandCopilot()}
      >
        {isLoading ? (
          <Sparkles size={20} color={isDark ? 'white' : theme.color?.get()} />
        ) : (
          <Bot size={20} color={theme.color?.get()} />
        )}
      </Button>
  );
} 