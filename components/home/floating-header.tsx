import { Bell } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { XStack, Image, Text, Button } from "tamagui";
import { MotiView } from "moti";
import { useWindowDimensions } from "react-native";
import { useCampus } from "@/lib/hooks/useCampus";
import { useTheme } from "tamagui";
import { useColorScheme } from "react-native";
import { useHeaderHeight } from '@react-navigation/elements';

export function FloatingHeader() {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    const { campus } = useCampus();
    const headerHeight = useHeaderHeight();
    return (
        <MotiView
        key="floating-header"
        from={{
          opacity: 0,
          translateY: -50,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        exit={{
          opacity: 0,
          translateY: -50,
        }}
        transition={{
          type: 'spring',
          damping: 20,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <BlurView
          intensity={80}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={{
            paddingTop: headerHeight,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <Image
                source={require('@/assets/logo-light.png')}
                width={32}
                height={32}
                borderRadius={8}
              />
              <Text fontWeight="600" fontSize={18}>
                {campus?.name || 'BISO'}
              </Text>
            </XStack>
            <XStack gap="$3">
              <Button
                circular
                size="$3"
                backgroundColor="$backgroundTransparent"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => {/* Handle notifications */}}
              >
                <Bell size={20} color={theme?.color?.get()} />
              </Button>
              <Button
                backgroundColor="$blue9"
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$6"
                onPress={() => router.push('/explore/events')}
              >
                <Text color="white" fontWeight="500">
                  Explore
                </Text>
              </Button>
            </XStack>
          </XStack>
        </BlurView>
      </MotiView>
    )
}