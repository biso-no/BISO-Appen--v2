import React, { useEffect } from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { H5, Avatar } from 'tamagui';
import { useAppwriteAccount } from '@/components/context/auth-context';
import { Home, UserRound, LogIn, Info, Settings} from '@tamagui/lucide-icons';
import { setupPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/components/context/auth-provider';
import Constants from 'expo-constants';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { data, profile, isLoading } = useAuth();


  const profileTitle = data?.$id ? `Profile` : 'Login';

  const avatarId = profile?.avatar;

  const isExpoGo = Constants.appOwnership === 'expo';


  useEffect(() => {
    console.log("User ID: ",data?.$id);
    if (!isExpoGo &&data?.$id && !isLoading) {
      setupPushNotifications(data.$id);
    }
  }), [data?.$id];

  //Profile icon is either:
  //- UserRound if logged in but no avatar_id is set
  //- LogIn if not logged in
  //- Avatar if logged in and avatar_id is set
  const profileIcon = () => {
    if (isLoading) {
      // Optionally return a loading indicator or null while loading
      return null; // or your preferred loading spinner
    } else if (!data?.$id) {
      // Not logged in
      return <LogIn size={25} />;
    } else if (!avatarId) {
      // Logged in but no avatar set
      return <UserRound size={25} />;
    } else {
      // Logged in and avatar set
      const avatarUrl = `https://appwrite-a0w8s4o.biso.no/v1/storage/buckets/avatar/files/${avatarId}/view?project=biso`;
      return (
        <Avatar circular size={25}>
          <Avatar.Image src={avatarUrl} />
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>
      );
    }
  };


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          headerTitle(props) {
            return <H5>Welcome to BISO</H5>;
          },
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Info
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
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: profileTitle,
          tabBarIcon: ({ color }) => profileIcon(),
          href: data?.$id ? undefined : '/auth/signIn',
        }}
      />
    </Tabs>
  );
}
