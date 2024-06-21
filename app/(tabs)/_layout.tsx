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
import { router } from 'expo-router';
import { useLastNotificationResponse } from 'expo-notifications'

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
  const isExpoGo = Constants.appOwnership === 'expo';

  const [notificationCount, setNotificationCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(!!data?.$id);
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

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

  const theme = useTheme();

  if (!theme.background) return "#fff"

  const backgroundColor = theme.background.val

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

  useEffect(() => {
    console.log('isExpoGo', isExpoGo);
    if (!isExpoGo && data?.$id && !isLoading) {
      setupPushNotifications(data.$id);
    }
  
  }, [data?.$id, isExpoGo, isLoading]);

useLastNotificationResponse();
  



  const profileIcon = (color = Colors[colorScheme ?? 'light'].text) => {
    if (isLoading || !data?.$id) {
      return <LogIn size={25} color={color} />;
    } else if (!avatarId) {
      return <UserRound size={25} color={color} />;
    } else {
      const avatarUrl = `https://appwrite-rg044w0.biso.no/v1/storage/buckets/avatar/files/${avatarId}/view?project=biso`;
      return (
        <Avatar circular size={25}>
          <Avatar.Image src={avatarUrl} />
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>
      );
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ChatProvider data={data}>
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
