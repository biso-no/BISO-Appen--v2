import React from 'react';
import { Link, Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { H5, Avatar, H4, View as TView, XStack, Button } from 'tamagui';
import { Home, UserRound, LogIn, MessageSquare, Bell } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/components/context/auth-provider';
import { useClientOnlyValue } from '../useClientOnlyValue';
import { CampusProvider, useCampus } from '@/lib/hooks/useCampus';
import CampusPopover from '../CampusPopover';
import { useChat } from '@/lib/ChatContext';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';

interface Props {
    profileIcon: (color: string) => JSX.Element
    bellIcon: () => JSX.Element
    backgroundColor: string
}

export default function AuthenticatedTabs({ profileIcon, bellIcon, backgroundColor }: Props) {
    
  const colorScheme = useColorScheme();

  const { data } = useAuth();
  const { currentChatGroupName } = useChat();

  //Capitalize all letters
  const capitalizeAllLetters = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (

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
            headerTitleAlign: 'center',
            headerTitle: () => (
              <CampusPopover />
            ),
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
            tabBarIcon: ({ color }) => profileIcon(color),
            href: 'profile/'
          }}
        />
        <Tabs.Screen
          name="auth/signIn/index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <LogIn color={color} />,
            href: null,
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
        title: capitalizeFirstLetter(currentChatGroupName ?? ''),
        href: null,
      }}
    />
      <Tabs.Screen
      name="chat/create"
      options={{
        href: null,
      }}
      />
      <Tabs.Screen
      name="chat/invite"
      options={{
        href: null,
      }}
      />
      </Tabs>
  );
}

