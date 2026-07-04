import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'alfwc:onboarding';
const NOTIFICATION_PREFS_KEY = 'alfwc:notification-preferences';

export type OnboardingRole = 'visiting' | 'attender' | 'leader' | 'skip';

export type OnboardingState = {
  completed: boolean;
  role: OnboardingRole;
  interests: string[];
  notificationExplained?: boolean;
};

export type NotificationPreferences = {
  allChurch: boolean;
  sermonFollowUp: boolean;
  prayer: boolean;
  events: boolean;
  volunteerSchedule: boolean;
  youthKids: boolean;
  menWomen: boolean;
  emergencyWeather: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  allChurch: true,
  sermonFollowUp: false,
  prayer: false,
  events: true,
  volunteerSchedule: false,
  youthKids: false,
  menWomen: false,
  emergencyWeather: true,
};

export async function loadOnboarding(): Promise<OnboardingState | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  return raw ? (JSON.parse(raw) as OnboardingState) : null;
}

export async function saveOnboarding(state: OnboardingState): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
}

export async function clearOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
  return raw ? (JSON.parse(raw) as NotificationPreferences) : defaultNotificationPreferences;
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}