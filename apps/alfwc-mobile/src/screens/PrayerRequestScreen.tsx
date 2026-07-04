import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Choice, Field, PrimaryButton, ScreenHeader } from '../components/ui';
import { submitPrayerRequest } from '../lib/api';
import { colors, spacing, typography } from '../theme/colors';

export default function PrayerRequestScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [request, setRequest] = useState('');
  const [visibility, setVisibility] = useState('elders_only');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (submitted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
        <Card style={styles.successCard}>
          <FontAwesome5 name="check-circle" size={48} color={colors.success} />
          <Text style={styles.successTitle}>Prayer request received</Text>
          <Text style={styles.successBody}>
            Thank you for trusting us with this. Your request has been submitted to the configured Supabase table for
            pastoral or prayer-team follow-up.
          </Text>
          <PrimaryButton
            label="Send another request"
            icon="plus"
            variant="secondary"
            onPress={() => {
              setSubmitted(false);
              setName('');
              setContact('');
              setRequest('');
            }}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      <ScreenHeader
        title="Prayer request"
        subtitle="How can we pray with you? This is a safe place to share what's on your heart."
      />

      <Card>
        <Text style={styles.noteTitle}>Who sees this?</Text>
        <Text style={styles.noteBody}>
          Choose whether this request is routed to pastors/elders only, the prayer team, or includes a request for someone
          to contact you.
        </Text>
      </Card>

      <Card>
        <Field label="Your name (optional)" value={name} onChangeText={setName} placeholder="Your name" />
        <Field
          label="Email or phone (optional)"
          value={contact}
          onChangeText={setContact}
          placeholder="How we can reach you"
          keyboardType="email-address"
        />
        <Field
          label="Prayer request"
          value={request}
          onChangeText={setRequest}
          placeholder="Share what you'd like prayer about..."
          multiline
          required
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.privacyLabel}>Who should receive this?</Text>
        <Choice label="Pastors/elders only" selected={visibility === 'elders_only'} onPress={() => setVisibility('elders_only')} type="radio" />
        <Choice label="Prayer team" selected={visibility === 'prayer_team'} onPress={() => setVisibility('prayer_team')} type="radio" />
        <Choice label="Contact me about this" selected={visibility === 'contact_me'} onPress={() => setVisibility('contact_me')} type="radio" />

        <PrimaryButton
          label={submitting ? 'Submitting…' : 'Submit prayer request'}
          icon="hands-helping"
          onPress={async () => {
            setError('');
            if (!request.trim()) return;

            setSubmitting(true);
            const result = await submitPrayerRequest({ name, contact, request, visibility });
            setSubmitting(false);

            if (result.ok) {
              setSubmitted(true);
            } else {
              setError(result.message);
            }
          }}
        />
        {submitting ? <ActivityIndicator style={styles.spinner} size="small" color={colors.primary} /> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  topBar: { marginBottom: spacing.md },
  noteTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', marginBottom: spacing.sm },
  noteBody: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 25 },
  successCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.success,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  successTitle: { color: colors.success, fontSize: 26, fontWeight: '900', lineHeight: 32, textAlign: 'center' },
  successBody: { color: colors.text, fontSize: typography.body, lineHeight: 25, textAlign: 'center' },
  privacyLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.error, fontSize: typography.meta, lineHeight: 20, marginBottom: spacing.md },
  spinner: { marginTop: spacing.md },
});