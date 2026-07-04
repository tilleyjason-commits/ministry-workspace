import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Choice, Field, PrimaryButton, ScreenHeader } from '../components/ui';
import { interests } from '../data/seed';
import { submitConnectCard } from '../lib/api';
import { FORM_LIMITS } from '../lib/formValidation';
import { colors, spacing, typography } from '../theme/colors';

export default function ConnectCardScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  if (submitted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
        <Card style={styles.successCard}>
          <FontAwesome5 name="check-circle" size={48} color={colors.success} />
          <Text style={styles.successTitle}>Thanks for connecting</Text>
          <Text style={styles.successBody}>
            We're glad you took this step. Your connect card has been submitted to the configured Supabase table for
            church office follow-up.
          </Text>
          <PrimaryButton
            label="Send another"
            icon="plus"
            variant="secondary"
            onPress={() => {
              setSubmitted(false);
              setName('');
              setContact('');
              setMessage('');
              setSelectedInterests([]);
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

      <ScreenHeader title="Connect card" subtitle="Take the next step. We'd love to know how we can serve you." />

      <Card>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="Your full name" required maxLength={FORM_LIMITS.name} />
        <Field
          label="Email or phone"
          value={contact}
          onChangeText={setContact}
          placeholder="How we can reach you"
          keyboardType="email-address"
          required
          maxLength={FORM_LIMITS.contact}
        />
        <Text style={styles.interestLabel}>I'm interested in…</Text>
        {interests.slice(0, 5).map((interest) => (
          <Choice
            key={interest}
            label={interest}
            selected={selectedInterests.includes(interest)}
            onPress={() => toggleInterest(interest)}
          />
        ))}
        <Field
          label="Message (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Anything else you'd like us to know?"
          multiline
          maxLength={FORM_LIMITS.connectMessage}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton
          label={submitting ? 'Submitting…' : 'Submit connect card'}
          icon="paper-plane"
          onPress={async () => {
            setError('');
            if (!name.trim() || !contact.trim()) return;

            setSubmitting(true);
            const result = await submitConnectCard({
              name,
              contact,
              message,
              interests: selectedInterests,
            });
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
  interestLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.success,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  successTitle: { color: colors.success, fontSize: 26, fontWeight: '900', lineHeight: 32, textAlign: 'center' },
  successBody: { color: colors.text, fontSize: typography.body, lineHeight: 25, textAlign: 'center' },
  errorText: { color: colors.error, fontSize: typography.meta, lineHeight: 20, marginBottom: spacing.md },
  spinner: { marginTop: spacing.md },
});