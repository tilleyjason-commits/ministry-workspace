import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  MetaRow,
  openExternalUrl,
  PrimaryButton,
  RemoteImage,
  ScreenHeader,
} from '../components/ui';
import * as seed from '../data/seed';
import { fetchSermons, type Sermon } from '../lib/api';
import { formatLongDate, shareMessage } from '../lib/dates';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

export default function SermonsScreen() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSermons()
      .then((items) => {
        if (!cancelled) setSermons(items);
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
        <Text style={styles.loadingText}>Loading sermons…</Text>
      </View>
    );
  }

  if (selected) {
    return <SermonDetail sermon={selected} onBack={() => setSelected(null)} />;
  }

  return <SermonList sermons={sermons} onSelect={setSelected} />;
}

function SermonList({
  sermons,
  onSelect,
}: {
  sermons: Sermon[];
  onSelect: (sermon: Sermon) => void;
}) {
  const latest = sermons[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Sermons"
        subtitle="Watch recent messages, reflect on Scripture, and keep the conversation going during the week."
      />

      <Card style={styles.latestCard}>
        <Text style={styles.kicker}>{latest.isLive ? 'Live now' : 'Latest message'}</Text>
        <RemoteImage uri={latest.thumbnailUrl} fallback="worship" />
        <Text style={styles.latestTitle}>{latest.title}</Text>
        <Text style={styles.latestMeta}>
          {latest.series} • {formatLongDate(latest.publishedAt)}
        </Text>
        <Text style={styles.description}>{latest.description}</Text>
        <View style={styles.actions}>
          <PrimaryButton label="Open details" icon="book-open" onPress={() => onSelect(latest)} />
          <PrimaryButton
            label="Watch on YouTube"
            icon="play"
            variant="secondary"
            onPress={() => openExternalUrl(latest.watchUrl)}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Recent messages</Text>
      {sermons.map((sermon) => (
        <Pressable
          key={sermon.id}
          accessibilityRole="button"
          accessibilityLabel={`Open sermon ${sermon.title}`}
          onPress={() => onSelect(sermon)}
          style={({ pressed }) => [styles.sermonPressable, pressed && styles.pressed]}
        >
          <Card style={styles.sermonRow}>
            <RemoteImage uri={sermon.thumbnailUrl} fallback="cross" style={styles.thumb} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{sermon.title}</Text>
              <Text style={styles.rowMeta}>{sermon.speaker}</Text>
              <Text style={styles.rowMeta}>{formatLongDate(sermon.publishedAt)}</Text>
              {sermon.scriptureReference ? (
                <Text style={styles.scripture}>{sermon.scriptureReference}</Text>
              ) : null}
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.textSecondary} />
          </Card>
        </Pressable>
      ))}

      <PrimaryButton
        label="Visit YouTube channel"
        icon="youtube"
        variant="secondary"
        onPress={() => openExternalUrl(seed.appConfig.youtubeChannelUrl, 'YouTube channel has not been configured yet.')}
      />
    </ScrollView>
  );
}

function SermonDetail({ sermon, onBack }: { sermon: Sermon; onBack: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to sermons" onPress={onBack} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={16} color={colors.primary} />
        <Text style={styles.backText}>Sermons</Text>
      </Pressable>

      <RemoteImage uri={sermon.thumbnailUrl} fallback="bible" style={styles.detailImage} />
      <Text style={styles.detailTitle}>{sermon.title}</Text>

      <View style={styles.metaBlock}>
        <MetaRow icon="user" text={sermon.speaker} />
        <MetaRow icon="calendar" text={formatLongDate(sermon.publishedAt)} />
        {sermon.series ? <MetaRow icon="bookmark" text={sermon.series} /> : null}
        {sermon.scriptureReference ? <MetaRow icon="bible" text={sermon.scriptureReference} /> : null}
      </View>

      <Text style={styles.description}>{sermon.description}</Text>

      <View style={styles.actions}>
        <PrimaryButton label="Watch on YouTube" icon="youtube" onPress={() => openExternalUrl(sermon.watchUrl)} />
        <PrimaryButton
          label="Share message"
          icon="share-alt"
          variant="secondary"
          onPress={() =>
            Share.share({
              message: shareMessage(sermon.title, sermon.watchUrl, sermon.description),
              url: sermon.watchUrl,
              title: sermon.title,
            })
          }
        />
      </View>

      {sermon.scriptureReference ? (
        <Card>
          <Text style={styles.cardTitle}>Scripture</Text>
          <Text style={styles.body}>{sermon.scriptureReference}</Text>
          <Text style={styles.helper}>Open your Bible or favorite Bible app and read the passage before discussion.</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>Discussion questions</Text>
        {(sermon.discussionQuestions ?? []).map((question, index) => (
          <View key={question} style={styles.questionRow}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.prayerCard}>
        <Text style={styles.cardTitle}>Prayer prompt</Text>
        <Text style={styles.body}>{sermon.prayerPrompt}</Text>
        <PrimaryButton
          label="Ask for prayer"
          icon="hands-helping"
          variant="ghost"
          onPress={() => openExternalUrl(seed.appConfig.prayerUrl, 'Prayer wall URL has not been configured yet.')}
        />
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
  latestCard: { backgroundColor: colors.primaryDark, borderColor: colors.border, gap: spacing.md },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  latestTitle: {
    color: colors.white,
    fontSize: 24,
    fontFamily: fonts.display,
    lineHeight: 30,
    textTransform: 'uppercase',
  },
  latestMeta: { color: colors.sky, fontSize: typography.meta, fontFamily: fonts.semibold },
  description: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 24 },
  actions: { gap: spacing.md },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontFamily: fonts.bold,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  sermonPressable: { marginBottom: spacing.md },
  sermonRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  thumb: { borderRadius: radius.md, height: 84, width: 98 },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { color: colors.white, fontSize: typography.body, fontFamily: fonts.bold, lineHeight: 22 },
  rowMeta: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 19 },
  scripture: { color: colors.mint, fontSize: typography.meta, fontFamily: fonts.semibold, lineHeight: 19 },
  pressed: { opacity: 0.74 },
  backButton: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 48 },
  backText: { color: colors.mint, fontSize: typography.body, fontFamily: fonts.bold },
  detailImage: { height: 220 },
  detailTitle: {
    color: colors.white,
    fontSize: 30,
    fontFamily: fonts.display,
    lineHeight: 36,
    textTransform: 'uppercase',
  },
  metaBlock: { gap: spacing.sm },
  cardTitle: {
    color: colors.white,
    fontSize: typography.cardTitle,
    fontFamily: fonts.bold,
    marginBottom: spacing.sm,
  },
  body: { color: colors.text, fontSize: typography.body, lineHeight: 25, marginBottom: spacing.lg },
  helper: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 21 },
  questionRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  questionNumber: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  questionNumberText: { color: colors.mint, fontFamily: fonts.bold },
  questionText: { color: colors.text, flex: 1, fontSize: typography.body, lineHeight: 24 },
  prayerCard: { backgroundColor: colors.surfaceAlt, borderColor: colors.accent },
});