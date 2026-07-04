import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Illustration, MetaRow, openExternalUrl, PrimaryButton, ScreenHeader } from '../components/ui';
import * as seed from '../data/seed';
import { fetchAppConfig, type AppConfig } from '../lib/api';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

export default function PlanVisitScreen() {
  const navigation = useNavigation();
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
        <Text style={styles.loadingText}>Loading visit info…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      <ScreenHeader
        title="Plan a visit"
        subtitle="We'd love to meet you. Here's what to expect when you join us."
      />

      <Card style={styles.heroCard}>
        <Illustration name="church" style={styles.heroImage} />
        <Text style={styles.heroTitle}>We're glad you're here.</Text>
        <Text style={styles.heroBody}>
          Whether you're visiting for the first time or returning after a while, you'll be welcomed warmly at Abundant
          Life.
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>When to come</Text>
        {config.serviceTimes.map((time) => (
          <MetaRow key={time} icon="clock" text={time} />
        ))}
        <PrimaryButton
          label="Get directions"
          icon="directions"
          variant="secondary"
          onPress={() => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(config.address)}`)}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>What to expect</Text>
        <MetaRow icon="music" text="Congregational worship with songs that point us to Christ" />
        <MetaRow icon="book-open" text="Expository preaching from Scripture" />
        <MetaRow icon="users" text="A warm, family-friendly atmosphere" />
        <MetaRow icon="clock" text="Plan for about 90 minutes for Sunday worship" />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Kids and families</Text>
        <Text style={styles.body}>
          We love welcoming kids and families. Specific classroom details, check-in procedures, and volunteer information
          should be added here before launch.
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>What we believe</Text>
        <Text style={styles.body}>
          We are a gospel-centered church committed to the authority of Scripture, the grace of God in Christ, and the
          mission of making disciples.
        </Text>
        <PrimaryButton label="Read more" icon="book" variant="secondary" onPress={() => navigation.goBack()} />
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
  loadingText: { color: colors.mint, fontSize: typography.body, fontFamily: fonts.bold },
  heroCard: { backgroundColor: colors.primaryDark, borderColor: colors.border, gap: spacing.md },
  heroImage: { height: 160, borderRadius: radius.md },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    textTransform: 'uppercase',
  },
  heroBody: { color: '#C7CDD8', fontSize: typography.body, lineHeight: 25 },
  cardTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: typography.cardTitle,
    marginBottom: spacing.md,
  },
  body: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 25 },
});