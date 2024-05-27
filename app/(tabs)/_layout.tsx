import React, { useEffect } from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { H5, Avatar } from 'tamagui';
import { Home, UserRound, LogIn, Info, Settings, Bell } from '@tamagui/lucide-icons';
import { setupPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/components/context/auth-provider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data, profile, isLoading } = useAuth();
  const avatarId = profile?.avatar;
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (!isExpoGo && data?.$id && !isLoading) {
      setupPushNotifications(data.$id);
    }
  }, [data?.$id]);

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
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
                  <Bell
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => profileIcon(),
          href: data?.$id ? 'profile/' : null,
        }}
      />
      <Tabs.Screen
        name="auth/signIn/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <LogIn color={color} />,
          href: !data?.$id ? 'auth/signIn' : null,
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
    </Tabs>
  );
}
