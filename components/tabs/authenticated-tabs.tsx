import React from 'react';
import { Link, Stack, Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { H5, Avatar, H4, View as TView, XStack, Button, XGroup } from 'tamagui';
import { Home, UserRound, LogIn, MessageSquare, LayoutList } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/components/context/auth-provider';
import { useClientOnlyValue } from '../useClientOnlyValue';
import { CampusProvider, useCampus } from '@/lib/hooks/useCampus';
import CampusPopover from '../CampusPopover';
import { useChat } from '@/lib/ChatContext';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { ModalProvider } from '../context/membership-modal-provider';

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

  const chatIcon = () => {
    return (
      <MessageSquare size={25} color={Colors[colorScheme ?? 'light'].text} />
    );
  };
  
  return (
    <ModalProvider>
      <Tabs
      initialRouteName='index'
      backBehavior='order'
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: { backgroundColor: backgroundColor, elevation: 0 },
          headerStyle: { backgroundColor: backgroundColor, elevation: 0 },
        }}
        sceneContainerStyle={{
          backgroundColor: backgroundColor,
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
              <XGroup space="$2" marginRight={10}>
                <XGroup.Item>
              <Link href="/notifications" asChild>
                <Pressable>
                  {({ pressed }) => (
                    {
                      ...bellIcon(),}
                  )}
                </Pressable>
              </Link>
                </XGroup.Item>
                  <XGroup.Item>
                    <Link href="/explore/chat" asChild>
                      <Pressable>
                        {({ pressed }) => (
                          {
                            ...chatIcon(),}
                        )}
                      </Pressable>
                    </Link>
                  </XGroup.Item>
              </XGroup>
            ),
          }}
        />
        <Stack.Screen
          name="explore/chat/index"
          options={{
            title: '',
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore/index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <LayoutList color={color} />,
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
        name="explore/expenses/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore/expenses/create/index"
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
      name="explore/units/index"
      options={{
        href: null,
      }}
    />
    <Tabs.Screen
    name="explore/chat/[id]"
    options={{
      href: null,
    }}
  />
  <Tabs.Screen
    name="explore/chat/create"
    options={{
      href: null,
    }}
    />
          <Tabs.Screen
      name="explore/chat/invite"
      options={{
        href: null,
      }}
      />
            <Tabs.Screen
      name="explore/products/index"
      options={{
        href: null,
      }}
      />
      <Tabs.Screen
        name="explore/news/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
          name="explore/products/[id]"
          options={{
            href: null,
          }}
       />
             <Tabs.Screen
          name="explore/elections/index"
          options={{
            href: null,
          }}
       />
      </Tabs>
    </ModalProvider>
  );
}

