import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, InfoRow, openExternalUrl, PrimaryButton, ScreenHeader } from '../components/ui';
import * as seed from '../data/seed';
import { fetchAppConfig, type AppConfig } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function MemberHubScreen() {
  const navigation = useNavigation<Navigation>();
  const [config, setConfig] = useState<AppConfig>(seed.appConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAppConfig()
      .then((next) => {
        if (!cancelled) setConfig(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading member hub…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      <ScreenHeader
        title="Member hub"
        subtitle="Member-only tools stay in their secure systems. The app keeps the links here so you can jump to what you need."
      />

      <Card>
        <Text style={styles.cardTitle}>Member systems</Text>
        <InfoRow
          title="Church Center"
          subtitle="Directory, groups, and giving history"
          onPress={() => openExternalUrl(config.planningCenterUrl, 'Church Center URL has not been configured yet.')}
        />
        <InfoRow
          title="CCB"
          subtitle="Member directory and records"
          onPress={() => openExternalUrl(config.ccbLoginUrl, 'CCB URL has not been configured yet.')}
        />
        <InfoRow
          title="Online prayer wall"
          subtitle="Share and track prayer updates"
          onPress={() => openExternalUrl(config.prayerUrl, 'Prayer wall URL has not been configured yet.')}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Pastoral care</Text>
        <InfoRow
          title="Request prayer"
          subtitle="Submit a private prayer request"
          onPress={() => navigation.navigate('PrayerRequest')}
        />
        <InfoRow
          title="Plan a visit for someone"
          subtitle="Send a visit follow-up request"
          onPress={() => navigation.navigate('PlanVisit')}
        />
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
});