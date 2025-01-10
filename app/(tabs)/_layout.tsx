import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Avatar, XStack, Text, Button, Stack } from 'tamagui';
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
import { router } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import CampusPopover from '@/components/CampusPopover';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'tamagui/linear-gradient';
import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data, profile, isLoading } = useAuth();
  const avatarId = profile?.avatar;
  const [image, setImage] = useState(profile?.avatar || '');
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigationState = useNavigationState(state => state);
  const pathname = usePathname();

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
        if (routesWithCampusPopover.includes(route.name)) {
          if (route.name === 'explore/index') {
            return (
              <Stack
                borderColor="$gray5"
                paddingBottom="$4"
                paddingHorizontal="$4"
                width="100%"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$4" alignItems="center">
                    <Button
                      chromeless
                      backgroundColor="$gray2"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$10"
                      flexDirection="row"
                      alignItems="center"
                    >
                        <CampusPopover />
                    </Button>
                  </XStack>
                  <Button 
                    circular 
                    size="$3" 
                    icon={Bell}
                    onPress={() => {/* Handle notifications */}}
                  />
                </XStack>
              </Stack>
            );
          }

          return (
            <View style={{ flex: 1, paddingTop: showCampusPopover ? 0 : insets.top }}>
              <StatusBar style={"auto"} />
              {showCampusPopover && (
                <XStack justifyContent="center" alignItems="center">
                  <CampusPopover />
                </XStack>
              )}
            </View>
          );
        }

        return (
          <XStack 
            justifyContent="space-between" 
            alignItems="center" 
            width="100%" 
            paddingHorizontal="$4"
          >
            <XStack flex={1} alignItems="center">
              <Button
                chromeless
                onPress={() => {
                  router.back();
                }}
              >
                <ChevronLeft size={25} color={Colors[colorScheme ?? 'light'].text} />
              </Button>
            </XStack>

            <XStack flex={2} justifyContent="center" alignItems="center">
              <Text key={route.key} fontSize={18} fontWeight="bold">
                {capitalizeFirstLetter(route.name.split('/')[0])}
              </Text>
            </XStack>

            <XStack flex={1} justifyContent="flex-end" alignItems="center">
              {isEventRoute && eventIcon()}
            </XStack>
          </XStack>
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
            header: () => (
              <XStack
                justifyContent="center"
                alignItems="center"
                paddingHorizontal={10}
                paddingVertical={5}
                width="100%"
                marginTop={insets.top}
              >
                <HeaderComponent />
              </XStack>
            ),
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

  if (isLoading) {
    return null;
  }

  return (
    <ChatProvider data={data}>
      <Tabs
        initialRouteName='index'
        backBehavior='history'
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: {
            backgroundColor: backgroundColor,
            elevation: 0,
          },
          headerStyle: { 
            backgroundColor: backgroundColor, 
            elevation: 0 
          },
          headerLeft: undefined,
        }}
      >
        {generateScreens()}
      </Tabs>
    </ChatProvider>
  );
}