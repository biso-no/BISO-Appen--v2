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
      if (route) {
        router.push(route);
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notification = response.notification;
      redirect(notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
