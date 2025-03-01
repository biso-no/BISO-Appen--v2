import 'expo-dev-client';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { useColorScheme } from '@/components/useColorScheme';
import { PortalProvider, TamaguiProvider, Theme } from 'tamagui';
import { config } from '../tamag.config';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { CampusProvider } from '@/components/context/core/campus-provider';
import { ModalProvider } from '@/components/context/core/modal-manager';
import { ModalProvider as MembershipModalProvider } from '@/components/context/membership-modal-provider';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { queryClient } from '@/lib/react-query';
import { RootProvider } from '@/components/context/root-provider';
import { PerformanceProvider, PerformanceToggle } from '@/lib/performance';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps',
  'Warning: TNodeChildrenRenderer: Support for defaultProps'
]);

export default function RootLayout() {
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isExpoGo = Constants.appOwnership === 'expo';

  const onCopy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch {
      return false;
    }
  };

  /*
useEffect(() => {
  if (!isExpoGo) {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);

    }
  }
  onFetchUpdateAsync();
  }
}, []);
*/

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootProvider>
            <CampusProvider>
              <PortalProvider shouldAddRootHost>
                <ModalProvider>
                  <MembershipModalProvider>
                    <PerformanceProvider>
                      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
                        <Stack initialRouteName='(tabs)'>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
                          <Stack.Screen name="bug-report" options={{ presentation: 'modal' }} />
                        </Stack>
                        {__DEV__ && <PerformanceToggle />}
                      </Theme>
                    </PerformanceProvider>
                  </MembershipModalProvider>
                </ModalProvider>
              </PortalProvider>
            </CampusProvider>
          </RootProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
