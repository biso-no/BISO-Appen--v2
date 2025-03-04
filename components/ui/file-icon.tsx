import React from 'react';
import { XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';

interface FileIconProps {
  type: string;
  size?: number;
}

export function FileIcon({ type, size = 40 }: FileIconProps) {
  return (
    <XStack
      width={size}
      height={size}
      backgroundColor="$blue3"
      justifyContent="center"
      alignItems="center"
      borderRadius={4}
    >
      <MaterialIcons name="insert-drive-file" size={size * 0.6} color="#666" />
    </XStack>
  );
} 