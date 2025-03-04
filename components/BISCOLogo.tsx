import React from 'react';
import { Stack, Text, XStack } from 'tamagui';

interface BISCOLogoProps {
  width?: number;
  height?: number;
}

export function BISCOLogo({ width = 120, height = 30 }: BISCOLogoProps) {
  return (
    <XStack alignItems="center" gap="$2">
      <Stack>
        <Text
          fontSize={height * 0.8}
          fontWeight="bold"
          color="$blue9"
        >
          BISO
        </Text>
      </Stack>
    </XStack>
  );
} 