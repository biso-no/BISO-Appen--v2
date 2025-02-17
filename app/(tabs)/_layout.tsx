import React, { useState, useEffect } from 'react';
import { Platform, Pressable, View, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Avatar, XStack, Text, Button, Stack, YStack, AnimatePresence } from 'tamagui';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { 
  UserRound, 
  LogIn, 
  Home, 
  LayoutList, 
  MessageSquare, 
  ChevronLeft, 
  Globe,
  Search,
  MapPin,
  Bell,
  Compass
} from '@tamagui/lucide-icons';
import { useAuth } from '@/components/context/auth-provider';
import { useTheme } from 'tamagui';
import * as Notifications from 'expo-notifications';
import { ChatProvider } from '@/lib/ChatContext';
import { router, Tabs } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import CampusPopover from '@/components/CampusPopover';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'tamagui/linear-gradient';
import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeColorScheme } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabBarIconProps {
  routeName: string;
  color: string;
  isActive: boolean;
}

interface BottomTabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  route: {
    name: string;
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data, profile, isLoading } = useAuth();
  const avatarId = profile?.avatar;
  const [image, setImage] = useState(profile?.avatar || '');
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigationState = useNavigationState(state => state);
  const pathname = usePathname();
  const scrollY = useSharedValue(0);
  const tabOffsetY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  // Define dynamic styles that depend on insets
  const dynamicStyles = StyleSheet.create({
    headerContainer: {
      position: 'relative',

      height: Platform.select({
        ios: 45 + (insets.top || 20),
        android: 40 + (insets.top || 20),
      }),
      zIndex: 100,
      backgroundColor: 'transparent',
      shadowColor: Platform.select({
        ios: 'rgba(0,0,0,0.15)',
        android: 'rgba(0,0,0,0.3)',
      }),
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    headerBackgroundContainer: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden' as const,
    },
    headerBlurView: {
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden' as const,
    },
    tabBar: {
      position: 'absolute' as const,
      bottom: 20,
      left: 20,
      right: 20,
      borderRadius: 24,
      height: 65,
      paddingBottom: 10,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      paddingTop: Platform.select({
        ios: 45 + (insets.top || 20),
        android: 40 + (insets.top || 20),
      }),
      paddingBottom: Platform.select({
        ios: 50 + (insets.bottom || 20),
        android: 60,
      }),
    },
  });

  if (!theme.background) return "#fff";
  const backgroundColor = theme.background.val;

  const profileIcon = (color = Colors[colorScheme ?? 'light'].text) => {
    if (!data?.$id) {
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

  const tabNames = data?.$id
    ? ['index', 'explore/index', 'profile/index']
    : ['index', 'explore/index', 'auth/signIn/index'];

  const isEventRoute = pathname.includes('/explore/events');

  const eventIcon = () => {
    return (
      <Pressable onPress={() => router.push("https://biso.no/events/")}>
        {({ pressed }) => (
          <MaskedView maskElement={<Globe size={25} color={Colors[colorScheme ?? 'light'].text} />} style={{ width: 25, height: 25 }}>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              themeInverse
              theme="accent"
              colors={['$color', '$color2']}
              style={{ width: 25, height: 25 }}
            />
          </MaskedView>
        )}
      </Pressable>
    );
  };

  const generateScreens = () => {
    const tabsRoute = navigationState.routes.find(route => route.name === '(tabs)');
    if (!tabsRoute || !tabsRoute.state || !tabsRoute.state.routes) return null;

    const nestedRoutes = tabsRoute.state.routes;
    const routesWithCampusPopover = ['index', 'explore/index', 'explore/units/index'];

    return nestedRoutes.map((route, index) => {
      const isTab = tabNames.includes(route.name);
      const showCampusPopover = routesWithCampusPopover.includes(route.name);

      const HeaderComponent = () => {
        const showCampusPopover = routesWithCampusPopover.includes(route.name);
        
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
              style={StyleSheet.absoluteFill}
            />
            <Animated.View 
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colorScheme === 'dark' 
                    ? 'rgba(0,0,0,0.3)' 
                    : 'rgba(255,255,255,0.3)',
                }
              ]} 
            />
      
            <StatusBar style="auto" />
            <Stack
              paddingBottom="$4"
              paddingHorizontal="$4"
              width="100%"
            >
              <XStack justifyContent="center" alignItems="center">
                <XStack gap="$4" alignItems="center">
                  <CampusPopover />
                </XStack>
              </XStack>
            </Stack>
          </View>
        );
      };

      return (
        <Tabs.Screen
          key={`${route.key}-${index}`}
          name={route.name}
          options={{
            title: '',
            tabBarIcon: isTab ? ({ color }: { color: string }) => getIconForRoute(route.name, color) : undefined,
            href: isTab ? undefined : null,
            header: () => <HeaderComponent />
          }}
        />
      );
    });
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

  const tabBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [0, scrollY.value > lastScrollY.value ? 100 : 0]
    );

    lastScrollY.value = scrollY.value;

    return {
      transform: [{ translateY: withSpring(translateY) }],
      backgroundColor: 'transparent',
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0]
    );

    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95]
    );

    return {
      opacity: withTiming(opacity),
      transform: [{ scale: withSpring(scale) }],
    };
  });

  const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, color, isActive }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(isActive ? 1 : 0.7);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const indicatorStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: withSpring(isActive ? 1 : 0) },
          { translateY: withSpring(isActive ? 0 : 10) }
        ],
        opacity: withSpring(isActive ? 1 : 0),
      };
    });

    const handlePress = () => {
      scale.value = withSpring(0.8, {}, () => {
        scale.value = withSpring(1);
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <AnimatedPressable
        onPress={handlePress}
        style={[animatedStyle, { padding: 8 }]}
      >
        <YStack alignItems="center" space="$1">
          <Animated.View style={[{ padding: 12, borderRadius: 16 }, isActive && {
            backgroundColor: Colors[colorScheme ?? 'light'].tint + '15',
          }]}>
            {getIconForRoute(routeName, color)}
          </Animated.View>
          <Animated.View 
            style={[
              {
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
                marginTop: -4,
              },
              indicatorStyle
            ]} 
          />
        </YStack>
      </AnimatedPressable>
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <ChatProvider data={data}>
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
              <Animated.View 
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colorScheme === 'dark' 
                      ? 'rgba(0,0,0,0.7)' 
                      : 'rgba(255,255,255,0.7)',
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
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
        })}
      >
        {generateScreens()}
      </Tabs>
    </ChatProvider>
  );
}