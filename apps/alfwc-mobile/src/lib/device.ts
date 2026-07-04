import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'alfwc:device-id';

function generateDeviceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 48);
}

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}