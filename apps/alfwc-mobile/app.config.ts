import { ExpoConfig, ConfigContext } from 'expo/config';

const webBasePath = process.env.EXPO_PUBLIC_WEB_BASE_PATH;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ALFWC',
  slug: 'alfwc-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  ...(webBasePath
    ? {
        experiments: {
          baseUrl: webBasePath,
        },
      }
    : {}),
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});