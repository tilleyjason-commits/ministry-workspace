import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Illustration, InfoRow, PrimaryButton, ScreenHeader } from '../components/ui';
import * as seed from '../data/seed';
import { fetchAppConfig, type AppConfig } from '../lib/api';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

type AboutView = null | 'beliefs' | 'leadership';

export default function AboutScreen() {
  const navigation = useNavigation();
  const [view, setView] = useState<AboutView>(null);
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
        <Text style={styles.loadingText}>Loading about info…</Text>
      </View>
    );
  }

  if (view === 'beliefs') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => setView(null)} />
        </View>
        <ScreenHeader title="What we believe" subtitle="A summary of our core convictions." />
        <Card>
          <Text style={styles.cardTitle}>The Bible</Text>
          <Text style={styles.body}>
            We believe the Scriptures are God's inspired Word, authoritative for faith and life.
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>The Gospel</Text>
          <Text style={styles.body}>
            We believe salvation is by grace alone, through faith alone, in Christ alone. Jesus lived the life we could
            not live, died in our place, and rose again.
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>The Church</Text>
          <Text style={styles.body}>
            We believe the church is God's family, called to worship, make disciples, serve one another, and reach the
            lost.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  if (view === 'leadership') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => setView(null)} />
        </View>
        <ScreenHeader title="Leadership" subtitle="Meet the people who serve this church family." />
        <Card>
          <Text style={styles.cardTitle}>Pastor Jason Tilley</Text>
          <Text style={styles.body}>
            Senior Pastor — preaching, pastoral care, and vision for the church family.
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Elders and ministry leaders</Text>
          <Text style={styles.body}>
            Leader names, photos, and ministry roles should be added here before launch.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <PrimaryButton label="← Back" icon="arrow-left" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      <ScreenHeader title="About ALFWC" subtitle="Who we are, what we believe, and who leads this church family." />

      <Card style={styles.heroCard}>
        <Illustration name="church" style={styles.heroImage} />
        <Text style={styles.heroTitle}>Abundant Life Family Worship Center</Text>
        <Text style={styles.heroBody}>
          A gospel-centered church in Cedar Grove, TN, committed to worship, Scripture, prayer, and making disciples.
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Explore</Text>
        <InfoRow title="What we believe" subtitle="Core convictions and gospel clarity" onPress={() => setView('beliefs')} />
        <InfoRow title="Leadership" subtitle="Pastor, elders, and ministry leaders" onPress={() => setView('leadership')} />
        <InfoRow title="Ministries" subtitle="Kids, youth, men, women, outreach" onPress={() => setView('beliefs')} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Contact</Text>
        <Text style={styles.body}>{config.churchName}</Text>
        <Text style={styles.body}>{config.address}</Text>
        <Text style={styles.body}>Phone: {config.phone}</Text>
        <Text style={styles.body}>Email: {config.email}</Text>
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
    fontSize: 24,
    lineHeight: 30,
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
  body: { color: colors.textSecondary, fontSize: typography.body, lineHeight: 25 },
});