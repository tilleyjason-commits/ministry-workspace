import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, InfoRow, openExternalUrl, PrimaryButton, ScreenHeader } from '../components/ui';
import * as seed from '../data/seed';
import { fetchAppConfig, type AppConfig } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function MoreScreen() {
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
    return <ActivityIndicator style={styles.loadingContainer} size="large" color={colors.primary} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="More" subtitle="Contact, social links, giving, and church resources." />

      <Card>
        <Text style={styles.cardTitle}>Contact</Text>
        <InfoRow title="Call the office" subtitle={config.phone} onPress={() => openExternalUrl(`tel:${config.phone}`)} />
        <InfoRow title="Email the office" subtitle={config.email} onPress={() => openExternalUrl(`mailto:${config.email}`)} />
        <InfoRow
          title="Get directions"
          subtitle={config.address}
          onPress={() => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(config.address)}`)}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Online</Text>
        <InfoRow
          title="YouTube"
          subtitle="Watch sermons and ministry updates"
          onPress={() => openExternalUrl(config.youtubeChannelUrl, 'YouTube channel has not been configured yet.')}
        />
        <InfoRow
          title="Facebook"
          subtitle="Follow ALFWC"
          onPress={() => openExternalUrl(config.facebookUrl, 'Facebook page has not been configured yet.')}
        />
        <InfoRow
          title="Instagram"
          subtitle="See photos and reminders"
          onPress={() => openExternalUrl(config.instagramUrl, 'Instagram page has not been configured yet.')}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Church resources</Text>
        <InfoRow
          title="Give"
          subtitle="Secure online giving through Tithe.ly"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Give' })}
        />
        <InfoRow
          title="Member hub"
          subtitle="Directory and member-only systems"
          onPress={() => navigation.navigate('MemberHub')}
        />
        <InfoRow
          title="About / beliefs / leadership"
          subtitle="Who we are and what we believe"
          onPress={() => navigation.navigate('About')}
        />
        <InfoRow
          title="Settings"
          subtitle="Notification and app preferences"
          onPress={() => navigation.navigate('Settings')}
        />
      </Card>

      <PrimaryButton label="Plan a visit" icon="door-open" variant="secondary" onPress={() => navigation.navigate('PlanVisit')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  loadingContainer: { flex: 1, backgroundColor: colors.background },
  cardTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
});