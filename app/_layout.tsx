import 'expo-dev-client';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/components/useColorScheme';
import { PortalProvider, TamaguiProvider, Theme } from 'tamagui';
import { config } from '../tamag.config';
import 'react-native-gesture-handler';
import { CampusProvider } from '@/components/context/core/campus-provider';
import { ModalProvider } from '@/components/context/core/modal-manager';
import { ModalProvider as MembershipModalProvider } from '@/components/context/membership-modal-provider';
import { LogBox } from 'react-native';
import { queryClient } from '@/lib/react-query';
import { RootProvider } from '@/components/context/root-provider';
import { PerformanceProvider } from '@/lib/performance';
import { AICopilotProvider } from '@/components/ai';

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


  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootProvider>
            <CampusProvider>
            <AICopilotProvider>
              <PortalProvider shouldAddRootHost>
                <ModalProvider>
                  <MembershipModalProvider>
                    <PerformanceProvider>
                      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
                        <Stack initialRouteName='(tabs)'>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
                          <Stack.Screen name="bug-report" options={{ presentation: 'modal' }} />
                        </Stack>
                      </Theme>
                    </PerformanceProvider>
                  </MembershipModalProvider>
                </ModalProvider>
              </PortalProvider>
              </AICopilotProvider>
            </CampusProvider>
          </RootProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
