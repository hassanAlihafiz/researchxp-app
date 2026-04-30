import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from '../../components/AppPressable';
import type { RootStackParamList } from '../../navigation/types';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

const AUTO_ADVANCE_MS = 8000;

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingValuePrimer'>;

export default function ValuePrimerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const [remain, setRemain] = useState(AUTO_ADVANCE_MS / 1000);

  const goWelcome = useCallback(() => {
    navigation.replace('OnboardingWelcomeReward');
  }, [navigation]);

  useEffect(() => {
    const tick = setInterval(() => {
      setRemain(r => Math.max(0, r - 1));
    }, 1000);
    const done = setTimeout(goWelcome, AUTO_ADVANCE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [goWelcome]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        },
        stat: {
          alignSelf: 'center',
          fontSize: 56,
          fontWeight: '800',
          color: colors.primary,
          marginVertical: 16,
        },
        title: {
          fontSize: 24,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 12,
          letterSpacing: -0.3,
        },
        body: {
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 24,
        },
        timer: {
          fontSize: 13,
          color: colors.textMuted,
          marginBottom: 16,
        },
        primary: {
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          marginBottom: 12,
        },
        primaryTxt: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '700',
        },
        skip: {
          alignItems: 'center',
          paddingVertical: 12,
        },
        skipTxt: {
          color: colors.textMuted,
          fontSize: 15,
          fontWeight: '600',
        },
      }),
    [colors, insets],
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.stat}>80%</Text>
      <Text style={styles.title}>{t('onboarding.valuePrimerHeadline')}</Text>
      <Text style={styles.body}>{t('onboarding.valuePrimerBody')}</Text>
      <Text style={styles.timer}>
        {remain > 0 ? `${remain}s` : ''}
      </Text>
      <AppPressable style={styles.primary} onPress={goWelcome}>
        <Text style={styles.primaryTxt}>{t('onboarding.valuePrimerCta')}</Text>
      </AppPressable>
      <AppPressable style={styles.skip} onPress={goWelcome} hitSlop={12}>
        <Text style={styles.skipTxt}>{t('onboarding.valuePrimerSkip')}</Text>
      </AppPressable>
    </ScrollView>
  );
}
