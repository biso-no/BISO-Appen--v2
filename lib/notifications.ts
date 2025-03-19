import { registerDeviceToken } from './appwrite';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// This function could be called from your app's entry point or after a user logs in
export async function setupPushNotifications(userId: string): Promise<string | null> {
  return await registerForPushNotificationsAsync(userId);
}

async function registerForPushNotificationsAsync(userId: string): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: permission not granted');
      return null;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (await Notifications.getDevicePushTokenAsync()).data;
    } catch (e) {
      console.error('Error getting push token:', e);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  if (token) {
    try {
      await registerDeviceToken(token);
    } catch (error) {
      // If error is "target already exists", we can safely ignore and continue
      if (error instanceof Error && 
          error.toString().includes('A target with the same ID already exists')) {
        console.log('Target already exists, continuing');
      } else {
        // For other errors, log but don't throw to prevent app crash
        console.error('Failed to register device token:', error);
      }
    }
  }

  return token;
}

// Hook to use in your app component to handle notifications
export function useNotifications(onNotificationReceived?: (notification: Notifications.Notification) => void, 
                               onNotificationResponse?: (response: Notifications.NotificationResponse) => void) {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Handle notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Handle user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });

    return () => {
      // Clean up listeners when component unmounts
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [onNotificationReceived, onNotificationResponse]);
}

// Helper to schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: trigger || null,
  });
}

// Get notification badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set notification badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}