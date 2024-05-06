import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
  name: 'ny',
  slug: 'ny',
  version: process.env.VERSION,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'nymheien',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.biso.no',
    googleServicesFile: process.env.GOOGLE_SERVICES_IOS,
  },
  android: {
    package: 'com.biso.no',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    '@react-native-firebase/app',
    ['expo-notifications'],
    ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
    ['expo-document-picker', { iCloudContainerEnvironment: 'Production' }],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECTID,
    },
  },
  experiments: {
    typedRoutes: true,
  },
})