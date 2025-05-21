import React, { useState } from 'react';
import { Platform, View, StyleSheet, ImageSourcePropType } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BlurView } from 'expo-blur';

import { useAuth } from '@/components/context/core/auth-provider';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'tamagui/linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useProfile } from '@/components/context/core/profile-provider';
// Add moti imports
import { MotiView } from 'moti';

import { withLayoutContext } from "expo-router";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext(
  createNativeBottomTabNavigator().Navigator,
)


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



interface TabBarIconProps {
  routeName: string;
  color: string;
  isActive: boolean;
}



export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const { profile } = useProfile();
  const avatarId = profile?.avatar;
  const [image, setImage] = useState(profile?.avatar || '');
  const insets = useSafeAreaInsets();


  const getIconForRoute = (routeName: string, color: string): ImageSourcePropType => {
    switch (routeName) {
      case 'index':
        return { uri: 'asset:/assets/icons/house.svg' };
      case 'explore/index':
        return { uri: 'asset:/assets/icons/compass.svg' };
      case 'profile/index':
        return { uri: 'asset:/assets/icons/userround.svg' };
      case 'auth/signIn/index':
        return { uri: 'asset:/assets/icons/login.svg' };
      default:
        return { uri: 'asset:/assets/icons/house.svg' };
    }
  };


  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          colors={colorScheme === 'dark' 
            ? ['$blue8', '$purple8']
            : ['$blue4', '$purple4']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Tabs
        initialRouteName='index'
        backBehavior='history'
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          safeAreaInsets: { top: 0 },
          contentStyle: {
            paddingTop: Platform.select({
              ios: 45 + (insets.top || 20),
              android: 40 + (insets.top || 20),
            }),
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill]}>
              <BlurView
                intensity={colorScheme === 'dark' ? 40 : 80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    overflow: 'hidden',
                  }
                ]}
              />
              <MotiView 
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colorScheme === 'dark' 
                      ? 'rgba(0,0,0,0.7)' 
                      : 'rgba(255,255,255,0.7)',
                    borderBottomLeftRadius: 24,
                    borderTopRightRadius: 24,
                  }
                ]} 
              />
            </View>
          ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: Platform.select({
              ios: 50 + (insets.bottom || 20),
              android: 60,
            }),
            paddingBottom: Platform.select({
              ios: insets.bottom || 20,
              android: 10,
            }),
            paddingTop: 10,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            shadowColor: colorScheme === 'dark' ? "#000" : "#666",
            shadowOffset: {
              width: 0,
              height: -8,
            },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          },
          tabBarIcon: ({ focused }) => getIconForRoute(route.name, focused ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].text),
          tabBarLabel: undefined,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: undefined,
            tabBarIcon: ({ focused }: { focused: boolean }) => 
              getIconForRoute('index', focused ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].text)
          }}
        />
        <Tabs.Screen 
          name="explore/index" 
          options={{ title: undefined }} 
        />
        {user?.$id ? (
          <Tabs.Screen 
            name="profile/index" 
            options={{ title: undefined }} 
          />
        ) : (
          <Tabs.Screen 
            name="auth/signIn/index" 
            options={{ title: undefined }} 
          />
        )}
      </Tabs>
    </>
  );
}