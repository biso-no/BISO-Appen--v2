import React, { useEffect, useState } from 'react';
import { Link, Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { H5, Avatar } from 'tamagui';
import { Home, UserRound, LogIn, Info, Settings, Bell, MessageSquare } from '@tamagui/lucide-icons';
import { setupPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/components/context/auth-provider';
import { useTheme } from 'tamagui';
import * as Notifications from 'expo-notifications';
import { getNotificationCount } from '@/lib/appwrite';
import { ChatProvider } from '@/lib/ChatContext';

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

  useEffect(() => {
    getNotificationCount().then((count) => {
      setNotificationCount(count);
    });
  }, []);

  useEffect(() => {
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

    // Listener for receiving notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received!', notification);
    });

    // Listener for handling interactions with notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received!', response);
    });

    // Unsubscribe from listeners when component unmounts
    return () => {
      Notifications.removeNotificationSubscription(subscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
  }, [data?.$id, isExpoGo, isLoading]);

  const profileIcon = () => {
    if (isLoading) {
      return null;
    } else if (!data?.$id) {
      return <LogIn size={25} />;
    } else if (!avatarId) {
      return <UserRound size={25} />;
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
      sceneContainerStyle={{
        backgroundColor: backgroundColor
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerTitle: () => <H5>Welcome to BISO</H5>,
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerRight: () => (
            <Link href="/notifications" asChild>
              <Pressable>
                {({ pressed }) => (
                  {
                    ...bellIcon(),}
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MessageSquare color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => profileIcon(),
          href: isAuthenticated  ? 'profile/' : null,
        }}
      />
      <Tabs.Screen
        name="auth/signIn/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <LogIn color={color} />,
          href: !isAuthenticated ? 'auth/signIn' : null,
        }}
      />
      <Tabs.Screen
        name="expenses/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="expenses/create/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="auth/verify-otp/[userId]/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
      name="units/index"
      options={{
        href: null,
      }}
    />
    <Tabs.Screen
    name="chat/[id]"
    options={{
      href: null,
    }}
  />
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
