import React, { useState } from 'react';
import { Platform, Pressable,View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Avatar, XStack, Text, Button } from 'tamagui';
import { UserRound, LogIn, Home, LayoutList, MessageSquare, ChevronLeft, Globe } from '@tamagui/lucide-icons';
import { useAuth } from '@/components/context/auth-provider';
import { useTheme } from 'tamagui';
import * as Notifications from 'expo-notifications';
import { ChatProvider } from '@/lib/ChatContext';
import { router } from 'expo-router';
import {
  registerTaskAsync,
} from 'expo-notifications';
import { defineTask } from 'expo-task-manager';
import { AppState } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import CampusPopover from '@/components/CampusPopover';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'tamagui/linear-gradient';
import { usePathname } from 'expo-router';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
  console.log(
    `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: App in ${AppState.currentState} state.`,
  );

  if (error) {
    console.log(`${Platform.OS} BACKGROUND-NOTIFICATION-TASK: Error! ${JSON.stringify(error)}`);
    return;
  }

  if (AppState.currentState.match(/inactive|background/) === null) {
    console.log(
      `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: App not in background state, skipping task.`,
    );
    return;
  }

  console.log(
    `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: Received a notification in the background! ${JSON.stringify(
      data,
      null,
      2,
    )}`,
  );
});

registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
  .then(() => {
    console.log(
      `${Platform.OS} Notifications.registerTaskAsync success: ${BACKGROUND_NOTIFICATION_TASK}`,
    );
  })
  .catch((reason) => {
    console.log(`${Platform.OS} Notifications registerTaskAsync failed: ${reason}`);
  });

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data, profile, isLoading, } = useAuth();
  const avatarId = profile?.avatar;

  const [image, setImage] = useState(profile?.avatar || '');

  const insets = useSafeAreaInsets();


  const theme = useTheme();
  const navigationState = useNavigationState(state => state);
  

  if (!theme.background) return "#fff"

  const backgroundColor = theme.background.val

  const pathname = usePathname();

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
          {({ pressed}) => (
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
    
      return nestedRoutes.map((route, index) => {
        const isTab = tabNames.includes(route.name);
        const routesWithCampusPopover = ['index', 'explore/index', 'explore/units/index'];

        const showCampusPopover = routesWithCampusPopover.includes(route.name);
    
        const HeaderComponent = () => {
          if (routesWithCampusPopover.includes(route.name)) {
            return (
                <View style={{ flex: 1, paddingTop: showCampusPopover ? 0 : insets.top }}>
                  {showCampusPopover && (
                    <XStack justifyContent="center" alignItems="center" paddingTop={insets.top}>
                      <CampusPopover />
                    </XStack>
                  )}
                </View>
            );
          }
    
          return (
            <XStack justifyContent="space-between" alignItems="center" width="100%" paddingTop="$8">
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
                <Text key={route.key} fontSize={18} fontWeight={"bold"}>
                  {capitalizeFirstLetter(route.name.split('/')[0])}
                </Text>
              </XStack>
          
              <XStack flex={1} justifyContent="flex-end" alignItems="center">
               {/* {isTab && data?.$id && chatIcon()} */}
                {isEventRoute && eventIcon()}
              </XStack>
            </XStack>
          );
          
        };
    
        return (
          <Tabs.Screen
            key={`${route.key}-${index}`} // Added index to ensure uniqueness
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
                  marginTop
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
        return <LayoutList color={color} marginTop="$2" />;
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
            headerStyle: { backgroundColor: backgroundColor, elevation: 0 },
            headerLeft: undefined,
          }}
          sceneContainerStyle={{ backgroundColor: backgroundColor }}
        >
          {generateScreens()}
        </Tabs>
  </ChatProvider>
);
}