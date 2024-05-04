import { registerDeviceToken } from './appwrite';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// This function could be called from your app's entry point or after a user logs in
export async function setupPushNotifications(userId: string) {
  await registerForPushNotificationsAsync(userId);
  setNotificationListeners();
}

async function registerForPushNotificationsAsync(userId: string) {

  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    await messaging().registerDeviceForRemoteMessages();

    await registerDeviceToken(userId, await messaging().getToken());

    
  }

  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await registerDeviceToken(userId, await messaging().getToken());
    }
  }
}
  


function setNotificationListeners() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
  });
}
