import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { loadOnboarding } from '../lib/storage';
import AboutScreen from '../screens/AboutScreen';
import ConnectCardScreen from '../screens/ConnectCardScreen';
import MemberHubScreen from '../screens/MemberHubScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlanVisitScreen from '../screens/PlanVisitScreen';
import PrayerRequestScreen from '../screens/PrayerRequestScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    loadOnboarding().then((state) => {
      setOnboardingComplete(Boolean(state?.completed));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Abundant Life…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {onboardingComplete ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="PlanVisit" component={PlanVisitScreen} />
          <Stack.Screen name="PrayerRequest" component={PrayerRequestScreen} />
          <Stack.Screen name="ConnectCard" component={ConnectCardScreen} />
          <Stack.Screen name="MemberHub" component={MemberHubScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      ) : (
        <OnboardingScreen onComplete={() => setOnboardingComplete(true)} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});