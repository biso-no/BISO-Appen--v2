import { useEffect } from 'react';
import { Platform } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import Constants from 'expo-constants';

/**
 * Hook to check for and handle in-app updates
 * @param checkOnMount Whether to check for updates when the component mounts
 */
export function useAppUpdates(checkOnMount = true) {
  const checkForUpdates = async () => {
    try {
      const inAppUpdates = new SpInAppUpdates(
        __DEV__ // Enable debug mode in development
      );
      
      // Get the current app version from expo config
      const currentVersion = Constants.expoConfig?.version || '';
      
      // Check if an update is needed
      const result = await inAppUpdates.checkNeedsUpdate({
        curVersion: currentVersion,
      });
      
      // If an update is available, start the update process
      if (result.shouldUpdate) {
        console.log(`Update available: ${currentVersion} → ${result.storeVersion}`);
        
        const updateOptions: StartUpdateOptions = Platform.select({
          android: {
            updateType: IAUUpdateKind.FLEXIBLE, // Use FLEXIBLE for a less intrusive update experience
          },
          ios: {
            title: 'Update Available',
            message: 'A new version of the app is available. Would you like to update now?',
            buttonUpgradeText: 'Update',
            buttonCancelText: 'Later',
          },
          default: {},
        }) as StartUpdateOptions;
        
        // Start the update process
        await inAppUpdates.startUpdate(updateOptions);
      } else {
        console.log('App is up to date');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };
  
  useEffect(() => {
    if (checkOnMount) {
      // Small delay to ensure app is fully loaded
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkOnMount]);
  
  return { checkForUpdates };
} 