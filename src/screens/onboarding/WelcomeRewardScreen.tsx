import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { claimWelcomeMoment } from '../../api/onboardingApi';
import type { MemberSurveyAssignment } from '../../api/memberSurveyAssignments';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { useLocale } from '../../locale';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';
import { fetchSurveyStart } from '../../api/surveyStart';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWelcomeReward'>;

function studyTitle(a: MemberSurveyAssignment): string {
  return (
    a.project_name?.trim() ||
    a.project_survey_name?.trim() ||
    a.project_code?.trim() ||
    `Study #${a.project_id}`
  );
}

export default function WelcomeRewardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const { token, updateSessionUser } = useAuth();
  const [busy, setBusy] = useState(true);
  const [openBusy, setOpenBusy] = useState(false);
  const [assignment, setAssignment] = useState<MemberSurveyAssignment | null>(null);
  const [credited, setCredited] = useState(false);
  const [bonusCents, setBonusCents] = useState(0);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);

  const goMain = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [navigation]);

  useEffect(() => {
    if (!token) {
      setBusy(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const res = await claimWelcomeMoment(token);
      if (cancelled) {
        return;
      }
      if (res.ok) {
        await updateSessionUser(res.user);
        setCredited(res.walletCredited);
        setBonusCents(res.welcomeBonusCents);
        setAssignment(res.assignment);
        setWelcomeError(null);
      } else {
        setWelcomeError(res.message);
      }
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, updateSessionUser]);

  const openSuggestedStudy = useCallback(async () => {
    if (!token || !assignment) {
      return;
    }
    const idNum = Number(assignment.id);
    if (!Number.isFinite(idNum)) {
      return;
    }
    setOpenBusy(true);
    try {
      const res = await fetchSurveyStart(token, idNum);
      if (!res.ok) {
        Alert.alert(
          t('survey.alertOpenFailedTitle'),
          res.message || t('survey.loadError'),
        );
        return;
      }
      if (res.data.internal_questions && res.data.screens?.length) {
        navigation.navigate('InternalSurvey', { assignmentId: idNum });
        return;
      }
      const u = (res.data.survey_url || '').trim();
      if (u && /^https?:\/\//i.test(u)) {
        Linking.openURL(u).catch(() => {});
        return;
      }
      Alert.alert(t('survey.alertOpenFailedTitle'), t('survey.loadError'));
    } finally {
      setOpenBusy(false);
    }
  }, [token, assignment, navigation, t]);

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
        h1: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 12,
          letterSpacing: -0.4,
        },
        body: {
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 16,
        },
        highlight: {
          fontSize: 40,
          fontWeight: '800',
          color: colors.primary,
          marginVertical: 8,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginTop: 8,
          marginBottom: 20,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        cardLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 6,
        },
        cardTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
        },
        warn: {
          fontSize: 14,
          lineHeight: 20,
          color: colors.textSecondary,
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
        secondary: {
          alignItems: 'center',
          paddingVertical: 12,
        },
        secondaryTxt: {
          color: colors.textMuted,
          fontSize: 15,
          fontWeight: '600',
        },
      }),
    [colors, insets],
  );

  const hasAssignment = Boolean(assignment && Number.isFinite(Number(assignment.id)));
  const bonusDisplay =
    credited && bonusCents > 0
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
          bonusCents / 100,
        )
      : null;

  return (
    <View style={styles.root}>
      {busy ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={styles.h1}>{t('onboarding.welcomeRewardTitle')}</Text>
          {bonusDisplay ? (
            <>
              <Text style={styles.body}>{t('onboarding.welcomeRewardCreditLine')}</Text>
              <Text style={styles.highlight}>{bonusDisplay}</Text>
            </>
          ) : (
            <Text style={styles.body}>{t('onboarding.welcomeRewardBody')}</Text>
          )}
          {welcomeError ? (
            <Text style={styles.warn}>
              {welcomeError.toLowerCase().includes('not configured') ||
              welcomeError.toLowerCase().includes('fully configured') ||
              welcomeError.toLowerCase().includes('welcome bonus') ||
              welcomeError.toLowerCase().includes('first survey')
                ? t('onboarding.welcomeRewardConfigHint')
                : welcomeError}
            </Text>
          ) : null}
          {assignment ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{t('onboarding.welcomeRewardPickLabel')}</Text>
              <Text style={styles.cardTitle}>{studyTitle(assignment)}</Text>
            </View>
          ) : null}
          {hasAssignment ? (
            <AppPressable
              style={[styles.primary, openBusy ? { opacity: 0.7 } : null]}
              disabled={openBusy}
              onPress={() => {
                void openSuggestedStudy();
              }}>
              {openBusy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryTxt}>{t('onboarding.welcomeRewardOpenStudy')}</Text>
              )}
            </AppPressable>
          ) : null}
          <AppPressable style={styles.primary} onPress={goMain}>
            <Text style={styles.primaryTxt}>{t('onboarding.welcomeRewardToHome')}</Text>
          </AppPressable>
          {hasAssignment ? (
            <AppPressable style={styles.secondary} onPress={goMain} hitSlop={12}>
              <Text style={styles.secondaryTxt}>{t('onboarding.welcomeRewardSkipOpen')}</Text>
            </AppPressable>
          ) : null}
        </>
      )}
    </View>
  );
}
