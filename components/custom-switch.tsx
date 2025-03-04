import { XStack, Stack } from "tamagui";
import { memo } from "react";

export const CustomSwitch = memo(({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <XStack
      backgroundColor={checked ? "$blue5" : "$gray5"}
      borderRadius="$10"
      width={52}
      height={28}
      padding="$1"
      animation="quick"
      pressStyle={{ scale: 0.97 }}
      onPress={() => onCheckedChange(!checked)}
      borderWidth={1}
      borderColor={checked ? "$blue8" : "$gray8"}
    >
      <Stack
        animation="bouncy"
        backgroundColor={checked ? "$blue10" : "white"}
        borderRadius="$10"
        width={24}
        height={24}
        x={checked ? 24 : 0}
        scale={checked ? 1.1 : 1}
      />
    </XStack>
  ));
  CustomSwitch.displayName = 'CustomSwitch';