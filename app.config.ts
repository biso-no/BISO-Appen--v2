import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'BISO',
  slug: 'BISO',
  owner: 'bi_student_organisation',
  newArchEnabled: true,
  version: "1.0.0",
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
    associatedDomains: ['applinks:auth.biso.no'],
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
    entitlements: {
      'aps-environment': 'production',
    },
    bundleIdentifier: 'com.biso.no',
    googleServicesFile: process.env.GOOGLE_SERVICES_IOS ?? './GoogleService-Info.plist',
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
    },
  },
  
  android: {
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'auth.biso.no',
            pathPrefix: '/',  // This now matches any path like /auth/verify, not /app/auth/verify
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    package: 'com.biso.no',
    versionCode: 54,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/ic_foreground.png',
      backgroundImage: './assets/ic_background.png',
    },
    permissions: ['com.google.android.gms.permission.AD_ID'],
  },
  
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  updates: {
    url: 'https://u.expo.dev' + process.env.EAS_PROJECTID,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-asset',
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
          deploymentTarget: "15.1"
        },
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 34,
          minSdkVersion: 34,
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