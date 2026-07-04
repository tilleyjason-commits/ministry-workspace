import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Choice, PrimaryButton, ScreenHeader } from '../components/ui';
import { fetchAppConfig, loadNotificationPreferencesForDevice, upsertNotificationPreferences } from '../lib/api';
import { getDeviceId } from '../lib/device';
import {
  defaultNotificationPreferences,
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '../lib/storage';
import { colors, spacing, typography } from '../theme/colors';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [backendConfigured, setBackendConfigured] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [id, localPrefs, remotePrefs, config] = await Promise.all([
        getDeviceId(),
        loadNotificationPreferences(),
        getDeviceId().then((nextId) => loadNotificationPreferencesForDevice(nextId)),
        fetchAppConfig(),
      ]);

      if (cancelled) return;

      setDeviceId(id);
      setPrefs(remotePrefs ?? localPrefs ?? defaultNotificationPreferences);
      setBackendConfigured(Boolean(config.email && config.email !== 'office@example.com'));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (!prefs || !deviceId) return;

    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    await saveNotificationPreferences(next);
    const result = await upsertNotificationPreferences(deviceId, next);
    setSaving(false);

    if (!result.ok) {
      console.warn('Could not save notification preferences to backend', result.message);
    }
  };

  if (!prefs || !deviceId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading preferences…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      <ScreenHeader
        title="Notification preferences"
        subtitle="Choose what updates you want to hear about. You can change these anytime."
      />

      <Card>
        <Text style={styles.cardTitle}>What to send me</Text>
        <Choice label="All church updates" selected={prefs.allChurch} onPress={() => togglePreference('allChurch')} />
        <Choice label="Sermon follow-up" selected={prefs.sermonFollowUp} onPress={() => togglePreference('sermonFollowUp')} />
        <Choice label="Prayer requests" selected={prefs.prayer} onPress={() => togglePreference('prayer')} />
        <Choice label="Events" selected={prefs.events} onPress={() => togglePreference('events')} />
        <Choice label="Volunteer schedule" selected={prefs.volunteerSchedule} onPress={() => togglePreference('volunteerSchedule')} />
        <Choice label="Youth and kids" selected={prefs.youthKids} onPress={() => togglePreference('youthKids')} />
        <Choice label="Men and women" selected={prefs.menWomen} onPress={() => togglePreference('menWomen')} />
        <Choice label="Emergency / weather alerts" selected={prefs.emergencyWeather} onPress={() => togglePreference('emergencyWeather')} />

        {saving ? (
          <Text style={styles.helper}>Saving preferences…</Text>
        ) : backendConfigured ? (
          <Text style={styles.helper}>Preferences are also saved to the connected church app backend.</Text>
        ) : (
          <Text style={styles.helper}>
            Preferences are saved on this device. Add Supabase credentials to sync across devices.
          </Text>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>App preferences</Text>
        <Text style={styles.body}>
          Future versions can add text size controls, simple mode, and saved content options here.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  topBar: { marginBottom: spacing.md },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: { color: colors.primary, fontSize: typography.body, fontWeight: '800' },
  cardTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  body: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 25 },
  helper: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 20, marginTop: spacing.lg },
});