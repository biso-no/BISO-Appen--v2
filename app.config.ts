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
  backgroundColor: "#fff",
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
    entitlements: {
      "aps-environment": "production"
    },
    bundleIdentifier: 'com.biso.no',
    googleServicesFile: process.env.GOOGLE_SERVICES_IOS ?? './GoogleService-Info.plist',
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
        }
      ]
    }
  },
  android: {
    package: 'com.biso.no',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
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
    'expo-font',
    [
      "expo-notifications",
      {
        "color": "#ffffff",
        "defaultChannel": "default",
      }
    ],
    [
      'expo-build-properties',
       { 
        ios: { 
          useFrameworks: 'static',
          newArchEnabled: false,
        },
        android: {
          newArchEnabled: false,
        },
      }],
    ['expo-document-picker', { iCloudContainerEnvironment: 'Production' }],
    [
      "expo-image-picker",
      {
        "photosPermission": "The app accesses your photos to allow you to upload."
      }
    ],
    [
      "expo-camera",
      {
        "cameraPermission": "Allow BISO to access your camera",
        "microphonePermission": "Allow BISO to access your microphone",
        "recordAudioAndroid": true
      }
    ]
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "c457ab17-1389-42bc-affd-800f0dd0768e"
    },
  },
  experiments: {
    typedRoutes: true,
  },
})