import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { XStack, Button, Stack as TStack } from 'tamagui';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import CampusPopover from '@/components/CampusPopover';
import { AICopilot } from '@/components/ai-copilot';

export default function MainLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const HeaderComponent = () => {
    const canGoBack = router.canGoBack();

    const handleBackPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.back();
    };

    return (
    <View style={{ 
      width: '100%', 
      overflow: 'hidden',
      borderRadius: 16,
      paddingTop: insets.top 
    }}>
      <BlurView
        intensity={colorScheme === 'dark' ? 40 : 80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          {
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            overflow: 'hidden',
          }
        ]}
      />
      <MotiView 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colorScheme === 'dark' 
              ? 'rgba(0,0,0,0.3)' 
              : 'rgba(255,255,255,0.3)',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }
        ]} 
      />

      <StatusBar style="auto" />
      <TStack
        paddingBottom="$4"
        paddingHorizontal="$4"
        width="100%"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack flex={1} justifyContent="flex-start">
            {canGoBack && (
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', damping: 18 }}
              >
                <Button
                  size="$3"
                  circular
                  icon={<ChevronLeft size={20} color={Colors[colorScheme ?? 'light'].text} />}
                  onPress={handleBackPress}
                  backgroundColor={Colors[colorScheme ?? 'light'].tint + '15'}
                  pressStyle={{ scale: 0.9, opacity: 0.8 }}
                  animation="quick"
                />
              </MotiView>
            )}
          </XStack>
          
          <XStack flex={2} justifyContent="center" alignItems="center">
            <XStack gap="$4" alignItems="center">
              <CampusPopover />
            </XStack>
          </XStack>
          
          <XStack flex={1} justifyContent="flex-end">
            <AICopilot />
          </XStack>
        </XStack>
      </TStack>
    </View>
    );
  };
  
  return (
    <>
      <HeaderComponent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: theme.background?.val || '#FFFFFF',
            paddingTop: Platform.select({
              ios: 0,
              android: 0,
            }),
          },
          // Improve performance by reducing animation duration
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        <Stack.Screen
        name="campus/[slug]/index"
        options={{
          title: 'Campus',
        }}
      />
      {/* Add other screens that should be part of this stack but not appear as tabs */}
      <Stack.Screen
        name="explore/events/index"
        options={{
          title: 'Events',
        }}
      />
      <Stack.Screen
        name="explore/products/index"
        options={{
          title: 'BISO Shop',
        }}
      />
      <Stack.Screen
        name="explore/units/index"
        options={{
          title: 'Units',
        }}
      />
      <Stack.Screen
        name="explore/expenses/index"
        options={{
          title: 'Reimbursements',
        }}
      />
      <Stack.Screen
        name="explore/volunteer/index"
        options={{
          title: 'Job Board',
        }}
      />
    </Stack>
    </>
  );
}

