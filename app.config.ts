import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
  name: 'BISO',
  slug: 'BISO',
  version: "0.9.99",
  orientation: 'portrait',
  icon: "./assets/icon-notrans.png",
  scheme: 'biso',
  userInterfaceStyle: 'automatic',
  backgroundColor: "#fff",
  splash: {
    image: './assets/splash.png',
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
    versionCode: 39,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      foregroundImage: "./assets/ic_foreground.png",
      backgroundImage: "./assets/ic_background.png",
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
    'expo-secure-store',
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
          deploymentTarget: "13.4"
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0"
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
      projectId: "4416309c-fcb7-4282-ad1a-2cad0300086f"
    },
  },
  experiments: {
    typedRoutes: true,
  },
})