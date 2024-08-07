import 'expo-dev-client';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '../tamag.config';
import { AuthProvider } from '@/components/context/auth-provider';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { CampusProvider } from '@/lib/hooks/useCampus';
import { ModalProvider } from '@/components/context/membership-modal-provider';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();


//Sentry SDK is compatbible with GlitchTip, which is currently the bug & error tracking software used by BISO.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sampleRate: 1,
  _experiments: {
    profilesSampleRate: 1.0,
  },
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      // ...
    }),
  ],
});

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



function RootLayout() {
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    ...FontAwesome.font,
  });

  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

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

export default Sentry.wrap(RootLayout);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isExpoGo = Constants.appOwnership === 'expo';



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


    <TamaguiProvider config={config}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <AuthProvider>
    <CampusProvider>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
      <ModalProvider>
      <Stack initialRouteName='(tabs)'>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="bug-report" options={{ presentation: 'modal' }} />
      </Stack>
      </ModalProvider>
      </Theme>
      </CampusProvider>
      </AuthProvider>
    </ThemeProvider>
    </TamaguiProvider>

  );
}
