import React from 'react';
import { Link, Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { H5, Avatar } from 'tamagui';
import { Home, LogIn, Bell, MessageSquare, LayoutList } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '../useClientOnlyValue';
import CampusPopover from '../CampusPopover';

interface UnauthenticatedTabsProps {
    profileIcon: () => JSX.Element
    bellIcon: () => JSX.Element
    backgroundColor: string
}

export default function UnauthenticatedTabs({ profileIcon, bellIcon, backgroundColor }: UnauthenticatedTabsProps) {
    
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      backBehavior='history'
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
            tabBarIcon: ({ color }) => <Home color={color} />
          }}
        />
        <Tabs.Screen
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
            href: null
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
      name="explore/chat/index"
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
  );
}
