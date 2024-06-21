import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';


export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const contentData = notification?.request?.content?.data;
      const remoteMessageData = notification?.request?.trigger?.remoteMessage?.data;
      
      const route = contentData?.href || remoteMessageData?.href;
      console.log('Now redirecting to:', route);
      if (route) {
        router.push(route);
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        console.log('Handling initial notification:', JSON.stringify(response.notification, null, 2));
        redirect(response.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notification = response.notification;
      console.log('Notification response received!', JSON.stringify(notification, null, 2));
      console.log('Data:', JSON.stringify(notification?.request?.content?.data, null, 2));
      console.log('Remote Message Data:', JSON.stringify(notification?.request?.trigger?.remoteMessage?.data, null, 2));
      redirect(notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
