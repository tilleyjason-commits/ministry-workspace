import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  DateChip,
  Doodle,
  Kicker,
  MetaRow,
  openExternalUrl,
  PrimaryButton,
  RemoteImage,
  Section,
  Tile,
} from '../components/ui';
import {
  fetchAppConfig,
  fetchEvents,
  fetchMinistryHighlight,
  fetchQuickActions,
  fetchSermons,
  type AppConfig,
  type EventItem,
  type MinistryHighlight,
  type QuickAction,
  type Sermon,
} from '../lib/api';
import { dateChipParts, formatLongDate, formatTimeRange } from '../lib/dates';
import * as seed from '../data/seed';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const [config, setConfig] = useState<AppConfig>(seed.appConfig);
  const [latestSermon, setLatestSermon] = useState<Sermon>(seed.sermons[0]);
  const [events, setEvents] = useState<EventItem[]>(seed.events.slice(0, 3));
  const [quickActions, setQuickActions] = useState<QuickAction[]>(seed.quickActions);
  const [highlight, setHighlight] = useState<MinistryHighlight>(seed.ministryHighlight);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [nextConfig, sermons, allEvents, actions, ministryHighlight] = await Promise.all([
        fetchAppConfig(),
        fetchSermons(),
        fetchEvents(),
        fetchQuickActions(),
        fetchMinistryHighlight(),
      ]);

      if (cancelled) return;

      setConfig(nextConfig);
      setLatestSermon(sermons[0] ?? seed.sermons[0]);
      setEvents(allEvents.slice(0, 3));
      setQuickActions(actions);
      setHighlight(ministryHighlight);
      setLoading(false);
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const navigateStack = (screen: Exclude<keyof RootStackParamList, 'MainTabs'>) => {
    navigation.navigate(screen);
  };

  const navigateTab = (screen: keyof import('../navigation/types').MainTabParamList) => {
    navigation.navigate('MainTabs', { screen });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mint} />
        <Text style={styles.loadingText}>Loading Abundant Life…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brandHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{config.locationLabel}</Text>
          <Text style={styles.brand}>You're welcome here</Text>
          <Doodle style={{ marginTop: spacing.sm }} />
        </View>
        <View accessibilityLabel="ALFWC logo mark" style={styles.logoMark}>
          <Text style={styles.logoText}>AL</Text>
        </View>
      </View>

      <Card style={styles.heroCard}>
        <View style={styles.heroLabelRow}>
          <Text style={styles.heroLabel}>Latest message</Text>
          <FontAwesome5 name="youtube" size={18} color={colors.white} />
        </View>
        <RemoteImage uri={latestSermon.thumbnailUrl} fallback="worship" style={styles.heroImage} />
        <Text style={styles.heroTitle}>{latestSermon.title}</Text>
        <Text style={styles.heroMeta}>
          {latestSermon.scriptureReference} • {latestSermon.speaker}
        </Text>
        <Text style={styles.heroBody}>{latestSermon.description}</Text>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Watch on YouTube" icon="play" onPress={() => openExternalUrl(latestSermon.watchUrl)} />
          <PrimaryButton label="Details" variant="secondary" onPress={() => navigateTab('Sermons')} />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Join us this week</Text>
        {config.serviceTimes.map((time) => (
          <MetaRow key={time} icon="clock" text={time} />
        ))}
        <MetaRow icon="map-marker-alt" text={config.address} />
        <PrimaryButton
          label="Get directions"
          icon="directions"
          variant="secondary"
          onPress={() => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(config.address)}`)}
        />
      </Card>

      <Section title="Quick actions">
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => {
                if (['Give', 'Sermons', 'Events', 'More', 'Home'].includes(action.destination)) {
                  navigateTab(action.destination as keyof import('../navigation/types').MainTabParamList);
                } else {
                  navigateStack(action.destination as Exclude<keyof RootStackParamList, 'MainTabs'>);
                }
              }}
              style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
            >
              <View style={styles.quickIcon}>
                <FontAwesome5 name={action.icon as never} size={19} color={colors.mint} />
              </View>
              <Text style={styles.quickText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Explore">
        <View style={styles.tileGrid}>
          <Tile name="church" label="Plan a Visit" onPress={() => navigateStack('PlanVisit')} />
          <Tile name="bible" label="Our Church" onPress={() => navigateStack('About')} />
          <Tile name="dove" label="Give" onPress={() => navigateTab('Give')} />
          <Tile name="hands" label="Member Hub" onPress={() => navigateStack('MemberHub')} />
        </View>
      </Section>

      <Section title="Upcoming events" actionLabel="View all" onAction={() => navigateTab('Events')}>
        {events.map((event) => {
          const chip = dateChipParts(event.startsAt);
          return (
            <Pressable
              key={event.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${event.title}`}
              onPress={() => navigateTab('Events')}
            >
              <Card style={styles.eventPreview}>
                <DateChip month={chip.month} day={chip.day} />
                <View style={styles.eventTextWrap}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventMeta}>
                    {formatLongDate(event.startsAt)} • {formatTimeRange(event.startsAt, event.endsAt)}
                  </Text>
                  <Text style={styles.eventMeta}>{event.locationName}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </Section>

      <Card style={styles.highlightCard}>
        <Kicker>Ministry highlight</Kicker>
        <Text style={styles.cardTitle}>{highlight.title}</Text>
        <Text style={styles.bodyText}>{highlight.body}</Text>
        <PrimaryButton label={highlight.cta} icon="arrow-right" variant="ghost" onPress={() => navigateStack('MemberHub')} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: { color: colors.mint, fontSize: typography.body, fontFamily: fonts.bold },
  brandHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.mint,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  brand: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  logoText: { color: colors.onPrimary, fontFamily: fonts.display, fontSize: 18 },
  heroCard: { backgroundColor: colors.primaryDark, borderColor: colors.border, gap: spacing.md },
  heroLabelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroLabel: {
    color: colors.mint,
    fontFamily: fonts.semibold,
    fontSize: typography.meta,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  heroImage: { height: 185 },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    textTransform: 'uppercase',
  },
  heroMeta: { color: colors.sky, fontSize: typography.meta, fontFamily: fonts.semibold },
  heroBody: { color: '#C7CDD8', fontSize: typography.body, lineHeight: 24 },
  buttonRow: { gap: spacing.md },
  cardTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: typography.cardTitle,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickTile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 104,
    justifyContent: 'center',
    padding: spacing.md,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  quickText: { color: colors.text, fontSize: typography.body, fontFamily: fonts.semibold },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  pressed: { opacity: 0.72 },
  eventPreview: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  eventTextWrap: { flex: 1, gap: 3 },
  eventTitle: { color: colors.white, fontSize: typography.body, fontFamily: fonts.bold },
  eventMeta: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 20 },
  highlightCard: { borderColor: colors.accent },
});