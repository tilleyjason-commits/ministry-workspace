import { FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Choice, Illustration, PrimaryButton, ScreenHeader } from '../components/ui';
import { interests } from '../data/seed';
import { upsertNotificationPreferences, upsertOnboardingProfile } from '../lib/api';
import { getDeviceId } from '../lib/device';
import {
  defaultNotificationPreferences,
  saveNotificationPreferences,
  saveOnboarding,
  type OnboardingRole,
} from '../lib/storage';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<OnboardingRole | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  const chooseRole = (nextRole: OnboardingRole) => {
    setRole(nextRole);
    setStep(2);
  };

  if (step === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Illustration name="worship" style={styles.heroImage} />
          <Text style={styles.heroTitle}>Welcome to Abundant Life</Text>
          <Text style={styles.heroBody}>
            Find service times, watch messages, connect, give, and stay up to date with what's happening at our church
            family.
          </Text>
          <Text style={styles.location}>Cedar Grove, TN</Text>
        </Card>

        <Card>
          <ScreenHeader
            title="How would you describe yourself?"
            subtitle="Choose the option that fits best. You can always change this later."
          />
          <Choice label="I'm visiting" selected={role === 'visiting'} onPress={() => chooseRole('visiting')} type="radio" />
          <Choice label="I attend ALFWC" selected={role === 'attender'} onPress={() => chooseRole('attender')} type="radio" />
          <Choice label="I serve or lead" selected={role === 'leader'} onPress={() => chooseRole('leader')} type="radio" />
          <Choice label="Skip for now" selected={role === 'skip'} onPress={() => chooseRole('skip')} type="radio" />
        </Card>
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="What updates would you like?"
          subtitle="Choose any that interest you. You can change these anytime."
        />
        <Card>
          {interests.map((interest) => (
            <Choice
              key={interest}
              label={interest}
              selected={selectedInterests.includes(interest)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
          <PrimaryButton label="Continue" icon="arrow-right" onPress={() => setStep(3)} />
        </Card>
        <PrimaryButton label="Skip preferences" icon="forward" variant="secondary" onPress={() => setStep(3)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Stay connected"
        subtitle="ALFWC can send reminders about services, events, and ministry updates you choose. You can change this anytime."
      />

      <Card style={styles.noticeCard}>
        <FontAwesome5 name="bell" size={40} color={colors.primary} />
        <Text style={styles.noticeTitle}>Notification notice</Text>
        <Text style={styles.noticeBody}>
          This app saves your preferences to the connected church app backend. Real push notifications can be added in a
          future phase.
        </Text>
      </Card>

      <Card>
        <Text style={styles.summaryTitle}>Your setup</Text>
        <Text style={styles.summaryText}>
          Role:{' '}
          {role === 'visiting'
            ? 'Visiting'
            : role === 'attender'
              ? 'Attends ALFWC'
              : role === 'leader'
                ? 'Serves or leads'
                : 'Not set yet'}
        </Text>
        <Text style={styles.summaryText}>
          Interests: {selectedInterests.length ? selectedInterests.join(', ') : 'None selected'}
        </Text>
      </Card>

      <PrimaryButton
        label={saving ? 'Saving…' : 'Finish setup'}
        icon="check"
        onPress={async () => {
          const state = {
            completed: true,
            role: role ?? 'skip',
            interests: selectedInterests,
            notificationExplained: true,
          };

          setSaving(true);
          await saveOnboarding(state);
          await saveNotificationPreferences(defaultNotificationPreferences);

          const deviceId = await getDeviceId();
          await upsertOnboardingProfile(deviceId, state);
          await upsertNotificationPreferences(deviceId, defaultNotificationPreferences);

          setSaving(false);
          onComplete();
        }}
      />
      {saving ? <ActivityIndicator style={styles.spinner} size="small" color={colors.primary} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
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
  location: {
    color: colors.mint,
    fontSize: typography.body,
    fontFamily: fonts.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent,
    gap: spacing.md,
    padding: spacing.xl,
  },
  noticeTitle: {
    color: colors.mint,
    fontFamily: fonts.bold,
    fontSize: typography.title,
    lineHeight: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  noticeBody: { color: colors.text, fontSize: typography.body, lineHeight: 25, textAlign: 'center' },
  summaryTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: typography.cardTitle,
    marginBottom: spacing.md,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  spinner: { marginTop: spacing.lg },
});