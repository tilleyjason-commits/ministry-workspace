import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Illustration, MetaRow, openExternalUrl, PrimaryButton, ScreenHeader } from '../components/ui';
import * as seed from '../data/seed';
import { fetchAppConfig, type AppConfig } from '../lib/api';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

export default function GiveScreen() {
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
      <ActivityIndicator style={styles.loadingContainer} size="large" color={colors.primary} />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Give"
        subtitle="Your giving is handled securely through Tithe.ly. We never collect or store payment details in the app."
      />

      <Card style={styles.heroCard}>
        <Illustration name="dove" style={styles.heroImage} />
        <Text style={styles.heroTitle}>Give securely</Text>
        <Text style={styles.heroBody}>
          Support the ministry of Abundant Life Family Worship Center through our trusted giving partner, Tithe.ly.
        </Text>
        <PrimaryButton
          label="Give with Tithe.ly"
          icon="external-link-alt"
          onPress={() => openExternalUrl(config.givingUrl, 'Tithe.ly giving URL has not been configured yet.')}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>What your giving supports</Text>
        <MetaRow icon="bullhorn" text="Local outreach and community care" />
        <MetaRow icon="users" text="Kids, youth, and family ministries" />
        <MetaRow icon="church" text="Sunday worship and teaching" />
        <MetaRow icon="hands-helping" text="Prayer and pastoral support" />
      </Card>

      <Card style={styles.trustCard}>
        <Text style={styles.cardTitle}>Your security matters</Text>
        <Text style={styles.body}>
          This app does not process payments or store card, ACH, donor, or giving history information. Tithe.ly handles all
          payment details in a secure hosted environment.
        </Text>
        <MetaRow icon="lock" text="No payment data enters this app" />
        <MetaRow icon="shield-alt" text="Hosted securely by Tithe.ly" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  loadingContainer: { flex: 1, backgroundColor: colors.background },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderColor: colors.border,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  heroImage: { height: 150, borderRadius: radius.md },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  heroBody: { color: '#C7CDD8', fontSize: typography.body, lineHeight: 25, textAlign: 'center' },
  cardTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: typography.cardTitle,
    marginBottom: spacing.md,
  },
  body: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 25, marginBottom: spacing.md },
  trustCard: { backgroundColor: colors.surfaceAlt, borderColor: colors.accent },
});