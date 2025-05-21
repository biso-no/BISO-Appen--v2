import 'expo-dev-client';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
import { useNotifications } from '@/lib/notifications';
import { useRouter } from 'expo-router';
import NoticeContainer from '@/components/ui/notice-container';
import AppUpdater from '@/components/app-updater';
import { AICopilotProvider } from '@/components/context/core/ai-copilot-provider';
import { Sheet } from '@tamagui/sheet';
import { AICopilot } from '@/components/ai-copilot';
import { useAICopilot } from '@/components/context/core/ai-copilot-provider';

// Silence console warnings about defaultProps
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (message, ...args) => {
    if (typeof message === 'string' && message.includes('defaultProps')) {
      return;
    }
    originalConsoleError.apply(console, [message, ...args]);
  };
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Combine all LogBox ignore patterns into a single call
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
  'Warning: TRenderEngineProvider: Support for defaultProps',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps',
  'Warning: TNodeChildrenRenderer: Support for defaultProps',
  'Warning: TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.',
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

function AICopilotSheetModal() {
  const { isOpen, setIsOpen, isEnabled } = useAICopilot();
  
  // Don't render the sheet if the feature is disabled
  if (!isEnabled) return null;
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  return (
    <Sheet
      forceRemoveScrollEnabled={isOpen}
      modal={true}
      open={isOpen}
      onOpenChange={handleOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$2" flex={1}>
        <AICopilot isModal />
      </Sheet.Frame>
    </Sheet>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { i18n } = useTranslation();

  // Force rerender when language changes
  const [, setForceUpdate] = useState(0);

  // Add language change listener
  useEffect(() => {
    const handleLanguageChanged = () => {
      // Force rerender of the entire app
      setForceUpdate(prev => prev + 1);
    };

    // Add the listener
    i18n.on('languageChanged', handleLanguageChanged);

    // Clean up
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Set up notification handlers
  useNotifications(
    (notification) => {
      // Handle foreground notification
      console.log('Notification received:', notification);
    },
    (response) => {
      // Handle notification response (user interaction)
      console.log('User interacted with notification:', response);
      
      // Navigate based on notification data if needed
      const data = response.notification.request.content.data;
      if (data && typeof data === 'object' && 'route' in data) {
        const route = data.route as string;
        if (route.startsWith('/')) {
          router.push(route as any);
        } else {
          router.navigate(route as any);
        }
      }
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootProvider>
            <CampusProvider>
              <PortalProvider shouldAddRootHost>
                <ModalProvider>
                  <AICopilotProvider>
                    <MembershipModalProvider>
                      <PerformanceProvider>
                        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
                        <NoticeContainer />
                        <AppUpdater />
                        <AICopilotSheetModal />
                        <Stack initialRouteName='(tabs)'>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="(main)" options={{ headerShown: false }} />
                          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
                          <Stack.Screen name="bug-report" options={{ presentation: 'modal' }} />
                        </Stack>
                      </Theme>
                      </PerformanceProvider>
                    </MembershipModalProvider>
                  </AICopilotProvider>
                </ModalProvider>
              </PortalProvider>
            </CampusProvider>
          </RootProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
