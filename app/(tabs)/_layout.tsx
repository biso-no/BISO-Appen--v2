import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { H5, Avatar } from 'tamagui';
import { Bell, UserRound, LogIn } from '@tamagui/lucide-icons';
import { setupPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/components/context/auth-provider';
import { useTheme } from 'tamagui';
import * as Notifications from 'expo-notifications';
import { getNotificationCount } from '@/lib/appwrite';
import { ChatProvider } from '@/lib/ChatContext';
import AuthenticatedTabs from '@/components/tabs/authenticated-tabs';
import UnauthenticatedTabs from '@/components/tabs/unauthenticated-tabs';
import { View, Text } from 'tamagui';
import { useNotificationObserver } from '@/lib/useNotifications';
import { router } from 'expo-router';  // Import the router
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
  useLastNotificationResponse,
} from 'expo-notifications';
import { defineTask } from 'expo-task-manager';
import { AppState } from 'react-native';
import { CampusProvider } from '@/lib/hooks/useCampus';

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
    `${
      Platform.OS
    } BACKGROUND-NOTIFICATION-TASK: Received a notification in the background! ${JSON.stringify(
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
  const { data, profile, isLoading } = useAuth();
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

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const theme = useTheme();

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
      return <LogIn size={25} color={color} />;
    } else if (!avatarId) {
      return <UserRound size={25} color={color} />;
    } else {
      const avatarUrl = `https://appwrite.biso.no/v1/storage/buckets/avatar/files/${avatarId}/view?project=biso`;
      return (
        <Avatar circular size={25}>
          <Avatar.Image src={avatarUrl} />
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>
      );
    }
  };

  //Notification bell icon including notification count
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


  if (isLoading) {
    return null;
  }
	
  return (
    <ChatProvider data={data}>
          <CampusProvider>
      {isAuthenticated ? (
        <AuthenticatedTabs
          profileIcon={profileIcon}
          bellIcon={bellIcon}
          backgroundColor={backgroundColor}
        />
      ) : (
        <UnauthenticatedTabs
          profileIcon={profileIcon}
          bellIcon={bellIcon}
          backgroundColor={backgroundColor}
        />
      )}
      </CampusProvider>
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
