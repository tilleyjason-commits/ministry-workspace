import { FontAwesome5 } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  ImageStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing, typography } from '../theme/colors';

export const illustrations = {
  cross: require('../../assets/img/cross-sunrise.4d1a9c95ebd7ea4f8bbe7cafd89e3748.png'),
  worship: require('../../assets/img/worship-gathered.bf0c513b83eeeae1d023175015655cb6.png'),
  family: require('../../assets/img/family.1d54033e552509b79701276319cec43a.png'),
  church: require('../../assets/img/church-building.bf1061375631fc8fa0c131acacfe219a.png'),
  bible: require('../../assets/img/open-bible.be17de9f7fcfb766cd53be9c9b8b65ef.png'),
  dove: require('../../assets/img/dove.2c3d0fa615359cbb8ed73afbfa15654c.png'),
  hands: require('../../assets/img/hands-community.b21df94eb9a2ca7eb828ebdeee82bc88.png'),
  shepherd: require('../../assets/img/shepherd.99d829541fe8c71a8015546d978512c8.png'),
  pray: require('../../assets/img/praying-hands.3209c5810ddde6d205b6f302f984aa2e.png'),
} as const;

export type IllustrationName = keyof typeof illustrations;

export function openExternalUrl(url?: string, warning = 'This link has not been configured yet.') {
  if (!url) {
    console.warn(warning);
    return;
  }

  Linking.openURL(url).catch((error) => {
    console.warn('Could not open URL', url, error);
  });
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Doodle({ style }: { style?: ViewStyle }) {
  return <View style={[styles.doodle, style]} accessibilityElementsHidden importantForAccessibility="no" />;
}

export function ScreenHeader({
  title,
  subtitle,
  kicker,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
}) {
  return (
    <View style={styles.headerBlock}>
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <Text style={styles.screenTitle}>{title}</Text>
      <Doodle />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
            onPress={onAction}
            style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}
          >
            <Text style={styles.inlineActionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Illustration({
  name,
  style,
}: {
  name: IllustrationName;
  style?: ImageStyle;
}) {
  return (
    <Image
      source={illustrations[name]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
      style={[styles.illustration, style]}
    />
  );
}

export function Tile({
  name,
  label,
  onPress,
}: {
  name: IllustrationName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <ImageBackground
        source={illustrations[name]}
        resizeMode="cover"
        style={styles.tileBg}
        imageStyle={styles.tileImg}
      >
        <View style={styles.tileScrim} />
        <Text style={styles.tileLabel}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const iconColor = variant === 'primary' ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <FontAwesome5 name={icon as never} size={15} color={iconColor} /> : null}
      <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MetaRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaRow}>
      <FontAwesome5 name={icon as never} size={14} color={colors.sky} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

export function RemoteImage({
  uri,
  style,
  fallback,
}: {
  uri?: string;
  style?: ImageStyle;
  fallback?: IllustrationName;
}) {
  if (!uri) {
    if (fallback) {
      return (
        <Image
          source={illustrations[fallback]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={[styles.image, style]}
        />
      );
    }

    return (
      <View style={[styles.imageFallback, style]}>
        <FontAwesome5 name="church" size={28} color={colors.mint} />
      </View>
    );
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      source={{ uri }}
      style={[styles.image, style]}
    />
  );
}

export function DateChip({ month, day }: { month: string; day: string }) {
  return (
    <View style={styles.dateChip} accessibilityLabel={`${month} ${day}`}>
      <Text style={styles.dateMonth}>{month}</Text>
      <Text style={styles.dateDay}>{day}</Text>
    </View>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {children} {required ? <Text style={styles.required}>(required)</Text> : null}
    </Text>
  );
}

export function Field({
  label,
  error,
  required,
  style,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Label required={required}>{label}</Label>
      <TextInput
        {...props}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={label}
        style={[styles.input, props.multiline && styles.multiline, error && styles.inputError, style]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function InfoRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

export function Choice({
  label,
  selected,
  onPress,
  type = 'checkbox',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  type?: 'checkbox' | 'radio';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={type === 'checkbox' ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.pressed]}
    >
      <View style={[styles.choiceMark, selected && styles.choiceMarkSelected]}>
        {selected ? (
          <Text style={styles.choiceCheck}>{type === 'radio' ? '•' : '✓'}</Text>
        ) : null}
      </View>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.mint,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  doodle: {
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.mint,
    marginTop: 2,
  },
  screenTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: typography.title,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: typography.section,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  inlineAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  inlineActionText: {
    color: colors.mint,
    fontSize: typography.meta,
    fontFamily: fonts.semibold,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  illustration: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  tile: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 128,
  },
  tileBg: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 128,
  },
  tileImg: {
    borderRadius: radius.lg,
  },
  tileScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,12,22,0.45)',
  },
  tileLabel: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    padding: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  buttonText: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.meta,
    lineHeight: 20,
  },
  image: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    height: 180,
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    height: 180,
    justifyContent: 'center',
    width: '100%',
  },
  dateChip: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    minWidth: 60,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dateMonth: {
    color: colors.onPrimary,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  dateDay: {
    color: colors.onPrimary,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 118,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  choice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(179,245,160,0.12)',
  },
  choiceMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceMarkSelected: {
    backgroundColor: colors.primary,
  },
  choiceCheck: {
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 15,
    lineHeight: 18,
  },
  choiceLabel: {
    color: colors.text,
    fontSize: typography.body,
    flex: 1,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.md,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: typography.body,
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.meta,
    lineHeight: 20,
    marginTop: 2,
  },
  chevron: {
    color: colors.mint,
    fontSize: 24,
    fontWeight: '700',
  },
});