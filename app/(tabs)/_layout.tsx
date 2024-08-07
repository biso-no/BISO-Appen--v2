import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { H5, Avatar, XStack, Text, Button } from 'tamagui';
import { Bell, UserRound, LogIn, Home, LayoutList, MessageSquare, ChevronLeft } from '@tamagui/lucide-icons';
import { setupPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/components/context/auth-provider';
import { useTheme } from 'tamagui';
import * as Notifications from 'expo-notifications';
import { getNotificationCount } from '@/lib/appwrite';
import { ChatProvider } from '@/lib/ChatContext';
import { Link, router } from 'expo-router';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  AndroidImportance,
  getNotificationChannelsAsync,
  NotificationResponse,
  registerTaskAsync,
  removeNotificationSubscription,
  setNotificationChannelAsync,
  Subscription,
} from 'expo-notifications';
import { defineTask } from 'expo-task-manager';
import { AppState } from 'react-native';
import { CampusProvider } from '@/lib/hooks/useCampus';
import { useNavigationState } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import CampusPopover from '@/components/CampusPopover';
import { SafeAreaView } from 'react-native-safe-area-context';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';

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
  const isExpoGo = Constants.appOwnership === 'expo';

  const [notificationCount, setNotificationCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(!!data?.$id);

  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [response, setResponse] = useState<NotificationResponse | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const [image, setImage] = useState(profile?.avatar || '');

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const theme = useTheme();
  const navigationState = useNavigationState(state => state);

  if (!theme.background) return "#fff"

  const backgroundColor = theme.background.val

  useEffect(() => {
    console.log('isExpoGo', isExpoGo);
    if (!isExpoGo && data?.$id && !isLoading) {
      setupPushNotifications(data.$id).then((token) => {
        setPushToken(token);
      });
    }
  }, [data?.$id, isExpoGo, isLoading]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setNotificationChannelAsync('Miscellaneous', {
        name: 'Miscellaneous',
        importance: AndroidImportance.HIGH,
      })
        .then((value) => {
          console.log(`Set channel ${value?.name}`);
          getNotificationChannelsAsync().then((value) =>
            setChannels(value ?? []),
          );
        })
        .catch((error) => {
          console.log(`Error in setting channel: ${error}`);
        });
    }

    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        console.log(
          `${Platform.OS} saw notification ${notification.request.content.title}`,
        );
      },
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        setResponse(response);
        console.log(
          `${Platform.OS} saw response for ${JSON.stringify(response, null, 2)}`,
        );

        // Handle navigation when a notification is pressed
        const notificationData = response.notification.request.trigger.remoteMessage.data;
        if (notificationData && notificationData.href) {
          console.log('Now redirecting to:', notificationData.href);
          router.push(notificationData.href);
        }
      },
    );

    console.log(`${Platform.OS} added listeners`);

    return () => {
      console.log(`${Platform.OS} removed listeners`);
      notificationListener.current &&
        removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    getNotificationCount().then((count) => {
      setNotificationCount(count);
    });
  }, []);

  useEffect(() => {
    console.log({
      "Status": isAuthenticated,
      "User ID": data?.$id,
    });
    setIsAuthenticated(!!data?.$id);
  }, [data?.$id]);

  const profileIcon = (color = Colors[colorScheme ?? 'light'].text) => {
    if (isLoading || !data?.$id) {
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
  const chatIcon = () => {
    return (
      <Pressable>
        {({ pressed}) => (
          <MessageSquare size={25} color={Colors[colorScheme ?? 'light'].text} onPress={() => router.push('/explore/chat')} />
        )}
      </Pressable>
    );
  };
  // Notification bell icon including notification count
  const bellIcon = () => {
    return (
      <View style={{ marginRight: 15 }}>
        <Bell size={25} color={Colors[colorScheme ?? 'light'].text} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </View>
    );
  };
  


  const tabNames = isAuthenticated
    ? ['index', 'explore/index', 'profile/index']
    : ['index', 'explore/index', 'auth/signIn/index'];


    const generateScreens = () => {
      // Find the tabs route in the navigation state
      const tabsRoute = navigationState.routes.find(route => route.name === '(tabs)');
      if (!tabsRoute || !tabsRoute.state || !tabsRoute.state.routes) return null;
    
      // Get all nested routes inside the tabs route
      const nestedRoutes = tabsRoute.state.routes;
    
      return nestedRoutes.map(route => {
        const isTab = tabNames.includes(route.name);
    
        const routesWithCampusPopover = ['index', 'explore/index', 'explore/units/index'];

        //A header component. 
        //If the route is not in routeswithcampuspoover, we display the title of the route in the middle of the header.
        //If the route is in routeswithcampuspoover, we display CampusPopover component in the middle of the header, and a chat icon in the right side of the header.
        const HeaderComponent = () => {
          if (routesWithCampusPopover.includes(route.name)) {
            return (
              <XStack justifyContent="space-between" alignItems="center" width="100%" paddingTop="$6">
                <XStack flex={1} justifyContent="center" alignItems="center">

                  <CampusPopover />
                </XStack>
                {isTab && chatIcon()}
              </XStack>
            );
          }
        
          return (
            <XStack justifyContent="space-between" alignItems="center" width="100%" paddingTop="$8">
              <XStack flex={1} justifyContent="center" alignItems="center">
              <Button position='absolute' chromeless left={10} onPress={() => {
                    router.back();
                  }}>
                    <ChevronLeft size={25} color={Colors[colorScheme ?? 'light'].text} />
                  </Button>
                <Text key={route.key} fontSize={18} fontWeight={"bold"}>
                  {capitalizeFirstLetter(route.name.split('/')[0])}
                </Text>
              </XStack>
              {isTab && chatIcon()}
            </XStack>
          );
        };

        return (
          <Tabs.Screen
          key={route.key} // key prop is correctly placed here
          name={route.name}
          options={{
            title: '',
            tabBarIcon: isTab ? ({ color }: { color: string }) => getIconForRoute(route.name, color) : undefined,
            href: isTab ? undefined : null,
            // Render the header component
            header: () => (
              <XStack
                justifyContent="center"
                alignItems="center"
                paddingHorizontal={10}
                paddingVertical={5}
                width="100%"
              >
                <HeaderComponent />
              </XStack>
            )
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 7,
    padding: 2,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
