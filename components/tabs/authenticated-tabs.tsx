import React, { useEffect } from 'react';
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
import { useNavigationState } from '@react-navigation/native';

interface Props {
  profileIcon: (color: string) => JSX.Element
  bellIcon: () => JSX.Element
  backgroundColor: string
}

const tabNames = ['index', 'explore/index', 'profile/index'];

export default function AuthenticatedTabs({ profileIcon, bellIcon, backgroundColor }: Props) {
  const colorScheme = useColorScheme();
  const { data } = useAuth();
  const { currentChatGroupName } = useChat();
  const navigationState = useNavigationState(state => state);

  const chatIcon = () => (
    <MessageSquare size={25} color={Colors[colorScheme ?? 'light'].text} />
  );

  useEffect(() => {
    // This returns all nested routes
    console.log('Navigation state 1:', navigationState.routes);
  }, [navigationState]);

  const generateScreens = () => {
    // Find the tabs route in the navigation state
    const tabsRoute = navigationState.routes.find(route => route.name === '(tabs)');
    if (!tabsRoute || !tabsRoute.state || !tabsRoute.state.routes) return null;

    // Get all nested routes inside the tabs route
    const nestedRoutes = tabsRoute.state.routes;

    return nestedRoutes.map(route => {
      const isTab = tabNames.includes(route.name);
      return (
        <Tabs.Screen
          key={route.key}
          name={route.name}
          options={{
            tabBarIcon: isTab ? ({ color }) => getIconForRoute(route.name, color) : undefined,
            href: isTab ? undefined : null,
          }}
        />
      );
    });
  };

  const getIconForRoute = (routeName: string, color: string) => {
    switch (routeName) {
      case 'index':
        return <Home color={color} />;
      case 'explore/index':
        return <LayoutList color={color} />;
      case 'profile/index':
        return profileIcon(color);
      default:
        return null;
    }
  };

  return (
    <ModalProvider>
      <Tabs
        initialRouteName='index'
        backBehavior='history'
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: { backgroundColor: backgroundColor, elevation: 0 },
          headerStyle: { backgroundColor: backgroundColor, elevation: 0 },
        }}
        sceneContainerStyle={{ backgroundColor: backgroundColor }}
      >
        {generateScreens()}
      </Tabs>
    </ModalProvider>
  );
}
