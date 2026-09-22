import { Platform } from 'react-native';

export type ApiConfig = {
  baseUrl: string;
  isConfigured: boolean;
  error: string | null;
};

export function getApiConfig(): ApiConfig {
  const envUrl = "https://api.megabytecircuit.com";

  if (!envUrl || !envUrl.trim()) {
    return {
      baseUrl: '',
      isConfigured: false,
      error:
        'Backend API URL is not configured. Please set EXPO_PUBLIC_API_URL in your .env file and restart Expo.',
    };
  }

  let cleanUrl = envUrl.trim().replace(/\/+$/, '');

  // If testing on Android emulator and URL uses localhost / 127.0.0.1, swap with 10.0.2.2
  // If user provided a specific LAN IP (e.g. 192.168.x.x), preserve it completely!
  if (Platform.OS === 'android') {
    cleanUrl = cleanUrl.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
  }

  if (!cleanUrl.includes('/api/mobile/v1')) {
    if (cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/mobile/v1`;
    } else {
      cleanUrl = `${cleanUrl}/api/mobile/v1`;
    }
  }

  return {
    baseUrl: cleanUrl,
    isConfigured: true,
    error: null,
  };
}
