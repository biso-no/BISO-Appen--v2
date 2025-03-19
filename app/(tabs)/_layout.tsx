import React, { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Avatar, XStack, Button, Stack, YStack } from 'tamagui';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
// Remove Reanimated imports
import { 
  UserRound, 
  LogIn, 
  Home, 
  Compass,
  ChevronLeft
} from '@tamagui/lucide-icons';
import { useAuth } from '@/components/context/core/auth-provider';
import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'tamagui/linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useProfile } from '@/components/context/core/profile-provider';
// Add moti imports
import { MotiView } from 'moti';
import { CopilotButton } from '@/components/ai';
import CampusPopover from '@/components/CampusPopover';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface TabBarIconProps {
  routeName: string;
  color: string;
  isActive: boolean;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const { profile } = useProfile();
  const avatarId = profile?.avatar;
  const [image, setImage] = useState(profile?.avatar || '');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const profileIcon = (color = Colors[colorScheme ?? 'light'].text) => {
    if (!user?.$id) {
      return <LogIn size={25} color={color} marginTop="$2" />;
    } else if (!avatarId) {
      return <UserRound size={25} color={color} marginTop="$2" />;
    } else {
      const avatarUrl = `https://appwrite.biso.no/v1/storage/buckets/avatar/files/${avatarId}/view?project=biso`;
      return (
        <Avatar circular size={30} bordered marginTop="$2">
          <Avatar.Image src={image || require('@/assets/images/placeholder.png')} />
        </Avatar>
      );
    }
  };

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
      <Stack
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
            <CopilotButton />
          </XStack>
        </XStack>
      </Stack>
    </View>
  );
};

  const getIconForRoute = (routeName: string, color: string) => {
    switch (routeName) {
      case 'index':
        return <Home color={color} marginTop="$2" />;
      case 'explore/index':
        return <Compass color={color} marginTop="$2" />;
      case 'profile/index':
        return profileIcon(color);
      case 'auth/signIn/index':
        return <LogIn color={color} marginTop="$2" />;
      default:
        return null;
    }
  };

  const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, color, isActive }) => {
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Add navigation logic based on route name
      switch (routeName) {
        case 'index':
          router.navigate('/(tabs)');
          break;
        case 'explore/index':
          router.navigate('/(tabs)/explore');
          break;
        case 'profile/index':
          router.navigate('/(tabs)/profile');
          break;
        case 'auth/signIn/index':
          router.navigate('/(tabs)/auth/signIn');
          break;
        default:
          break;
      }
    };

    return (
      <Button
        unstyled
        onPress={handlePress}
        paddingVertical="$2"
        paddingHorizontal="$2"
        animation="quick"
        pressStyle={{ scale: 0.9 }}
        opacity={isActive ? 1 : 0.7}
      >
        <YStack alignItems="center" gap="$1">
          <YStack 
            padding="$3" 
            borderRadius="$4"
            backgroundColor={isActive ? Colors[colorScheme ?? 'light'].tint + '15' : 'transparent'}
          >
            {getIconForRoute(routeName, color)}
          </YStack>
          <MotiView 
            from={{
              scale: 0,
              translateY: 10,
              opacity: 0,
            }}
            animate={{
              scale: isActive ? 1 : 0,
              translateY: isActive ? 0 : 10,
              opacity: isActive ? 1 : 0,
            }}
            transition={{
              type: 'spring',
            }}
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
              marginTop: -4,
            }}
          />
        </YStack>
      </Button>
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          colors={colorScheme === 'dark' 
            ? ['$blue8', '$purple8']
            : ['$blue4', '$purple4']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Tabs
        initialRouteName='index'
        backBehavior='history'
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          safeAreaInsets: { top: 0 },
          contentStyle: {
            paddingTop: Platform.select({
              ios: 45 + (insets.top || 20),
              android: 40 + (insets.top || 20),
            }),
          },
          lazy: true,
          unmountOnBlur: Platform.OS !== 'web',
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill]}>
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
                      ? 'rgba(0,0,0,0.7)' 
                      : 'rgba(255,255,255,0.7)',
                    borderBottomLeftRadius: 24,
                    borderTopRightRadius: 24,
                  }
                ]} 
              />
            </View>
          ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: Platform.select({
              ios: 50 + (insets.bottom || 20),
              android: 60,
            }),
            paddingBottom: Platform.select({
              ios: insets.bottom || 20,
              android: 10,
            }),
            paddingTop: 10,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            shadowColor: colorScheme === 'dark' ? "#000" : "#666",
            shadowOffset: {
              width: 0,
              height: -8,
            },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              routeName={route.name}
              color={color}
              isActive={focused}
            />
          ),
          tabBarLabel: () => null,
          header: () => <HeaderComponent />
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
          }}
        />
        <Tabs.Screen
          name="explore/index"
          options={{
            title: '',
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: '',
            href: user?.$id ? '/(tabs)/profile' : null,
          }}
        />
        <Tabs.Screen
          name="auth/signIn/index"
          options={{
            title: '',
            href: user?.$id ? null : '/(tabs)/auth/signIn',
          }}
        />
      </Tabs>
    </>
  );
}