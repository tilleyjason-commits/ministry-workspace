import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  DateChip,
  MetaRow,
  openExternalUrl,
  PrimaryButton,
  RemoteImage,
  ScreenHeader,
} from '../components/ui';
import { fetchEvents, type EventItem } from '../lib/api';
import { dateChipParts, formatLongDate, formatTimeRange, googleCalendarUrl, shareMessage } from '../lib/dates';
import { colors, radius, spacing, typography } from '../theme/colors';

export default function EventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((items) => {
        if (!cancelled) setEvents(items);
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
        <Text style={styles.loadingText}>Loading events…</Text>
      </View>
    );
  }

  if (selected) {
    return <EventDetail event={selected} onBack={() => setSelected(null)} />;
  }

  return <EventList events={events} onSelect={setSelected} />;
}

function EventList({
  events,
  onSelect,
}: {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}) {
  const featured = events.find((event) => event.featured) ?? events[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Events"
        subtitle="Find upcoming gatherings, RSVP through configured church links, and add reminders to your calendar."
      />

      <Card style={styles.featuredCard}>
        <Text style={styles.kicker}>Featured event</Text>
        <RemoteImage uri={featured.imageUrl} fallback="family" />
        <Text style={styles.featuredTitle}>{featured.title}</Text>
        <View style={styles.metaBlock}>
          <MetaRow
            icon="calendar"
            text={`${formatLongDate(featured.startsAt)} • ${formatTimeRange(featured.startsAt, featured.endsAt)}`}
          />
          <MetaRow
            icon="map-marker-alt"
            text={[featured.locationName, featured.address].filter(Boolean).join(' • ')}
          />
        </View>
        <Text style={styles.description}>{featured.description}</Text>
        <PrimaryButton label="View event details" icon="calendar-check" onPress={() => onSelect(featured)} />
      </Card>

      <Text style={styles.sectionTitle}>Upcoming events</Text>
      {events.map((event) => {
        const chip = dateChipParts(event.startsAt);
        return (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            accessibilityLabel={`Open event ${event.title}`}
            onPress={() => onSelect(event)}
            style={({ pressed }) => [styles.eventPressable, pressed && styles.pressed]}
          >
            <Card style={styles.eventRow}>
              <DateChip month={chip.month} day={chip.day} />
              <View style={styles.rowText}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {event.category} • {formatTimeRange(event.startsAt, event.endsAt)}
                </Text>
                <Text style={styles.eventMeta}>{event.locationName}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color={colors.textSecondary} />
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function EventDetail({ event, onBack }: { event: EventItem; onBack: () => void }) {
  const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.address ?? event.locationName ?? event.title)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to events" onPress={onBack} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={16} color={colors.primary} />
        <Text style={styles.backText}>Events</Text>
      </Pressable>

      <RemoteImage uri={event.imageUrl} fallback="cross" style={styles.detailImage} />
      <Text style={styles.detailTitle}>{event.title}</Text>
      {event.category ? <Text style={styles.categoryPill}>{event.category}</Text> : null}

      <Card>
        <Text style={styles.cardTitle}>When and where</Text>
        <View style={styles.metaBlock}>
          <MetaRow icon="calendar" text={formatLongDate(event.startsAt)} />
          <MetaRow icon="clock" text={formatTimeRange(event.startsAt, event.endsAt)} />
          {event.locationName ? <MetaRow icon="map-marker-alt" text={event.locationName} /> : null}
          {event.address ? <MetaRow icon="location-arrow" text={event.address} /> : null}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>About this event</Text>
        <Text style={styles.body}>{event.description}</Text>
        {event.contactName || event.contactEmail ? (
          <Text style={styles.helper}>
            Questions? Contact {event.contactName ?? 'the church office'}
            {event.contactEmail ? ` at ${event.contactEmail}` : ''}.
          </Text>
        ) : null}
      </Card>

      <View style={styles.actions}>
        <PrimaryButton
          label="Register or RSVP"
          icon="external-link-alt"
          onPress={() => openExternalUrl(event.registrationUrl, 'Registration link has not been configured yet.')}
        />
        <PrimaryButton
          label="Add to calendar"
          icon="calendar-plus"
          variant="secondary"
          onPress={() => openExternalUrl(googleCalendarUrl(event))}
        />
        <PrimaryButton
          label="Share event"
          icon="share-alt"
          variant="secondary"
          onPress={() =>
            Share.share({
              message: shareMessage(
                event.title,
                event.registrationUrl,
                `${formatLongDate(event.startsAt)} at ${formatTimeRange(event.startsAt, event.endsAt)}\n${event.description ?? ''}`,
              ),
              title: event.title,
              url: event.registrationUrl,
            })
          }
        />
        <PrimaryButton label="Get directions" icon="directions" variant="ghost" onPress={() => openExternalUrl(directionsUrl)} />
      </View>
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
  loadingText: { color: colors.primary, fontSize: typography.body, fontWeight: '800' },
  featuredCard: { gap: spacing.md },
  kicker: {
    color: colors.primary,
    fontSize: typography.meta,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuredTitle: { color: colors.text, fontSize: 25, fontWeight: '900', lineHeight: 31 },
  metaBlock: { gap: spacing.sm },
  description: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 24 },
  sectionTitle: { color: colors.text, fontSize: typography.section, fontWeight: '900', marginTop: spacing.sm },
  eventPressable: { marginBottom: spacing.md },
  eventRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  rowText: { flex: 1, gap: 3 },
  eventTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900', lineHeight: 22 },
  eventMeta: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 20 },
  pressed: { opacity: 0.74 },
  backButton: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 48 },
  backText: { color: colors.primary, fontSize: typography.body, fontWeight: '900' },
  detailImage: { height: 220 },
  detailTitle: { color: colors.text, fontSize: 30, fontWeight: '900', lineHeight: 36 },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    color: colors.primary,
    fontSize: typography.meta,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', marginBottom: spacing.md },
  body: { color: colors.text, fontSize: typography.body, lineHeight: 25 },
  helper: { color: colors.textSecondary, fontSize: typography.meta, lineHeight: 21, marginTop: spacing.md },
  actions: { gap: spacing.md },
});