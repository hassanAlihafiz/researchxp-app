import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsSummary } from '../../data/dummyData';
import { DASHBOARD_SCROLL_PADDING_TOP } from '../../theme/dashboardStyles';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';
import {
  fetchMySurveyAssignments,
  type MemberSurveyAssignment,
} from '../../api/memberSurveyAssignments';
import { fetchSurveyStart } from '../../api/surveyStart';
import {
  dismissImpactCardRequest,
  fetchImpactCard,
  type ImpactCardApiPayload,
} from '../../api/onboardingApi';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { createHomeStyles } from './createHomeStyles';
import { navigationRef } from '../../navigation/navigationRef';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

function isAssignmentCompleted(status: string | null | undefined): boolean {
  const s = String(status || '').toLowerCase();
  return s === 'completed' || s === 'success';
}

function assignmentTitle(
  a: MemberSurveyAssignment,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const name = a.project_name?.trim();
  const surveyName = a.project_survey_name?.trim();
  const code = a.project_code?.trim();
  if (name) {
    return name;
  }
  if (surveyName) {
    return surveyName;
  }
  if (code) {
    return code;
  }
  return t('home.surveyUntitled', { projectId: a.project_id });
}

function openSurveyUrl(url: string): void {
  const u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    return;
  }
  Linking.openURL(u).catch(() => {});
}

export default function HomeScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorScheme } = useAppTheme();
  const { t } = useLocale();
  const { token, signOut, updateSessionUser } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const styles = useMemo(
    () => createHomeStyles(colors, colorScheme),
    [colors, colorScheme],
  );
  const [assignments, setAssignments] = useState<MemberSurveyAssignment[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showAllSurveyRows, setShowAllSurveyRows] = useState(false);
  const [impactCard, setImpactCard] = useState<ImpactCardApiPayload | null>(null);
  const [impactBusy, setImpactBusy] = useState(false);
  const [openingAssignmentId, setOpeningAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setAssignments([]);
        setLoading(false);
        setLoadError(false);
        return;
      }
      setAssignments(null);
      setLoading(true);
      setLoadError(false);
      const result = await fetchMySurveyAssignments(token);
      if (cancelled) {
        return;
      }
      if (result === 'account_disabled') {
        await signOut();
        return;
      }
      if (result === null) {
        setLoadError(true);
        setAssignments([]);
      } else {
        setAssignments(result);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, signOut]);

  const onRefresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setRefreshing(true);
    setLoadError(false);
    const result = await fetchMySurveyAssignments(token);
    if (result === 'account_disabled') {
      await signOut();
      setRefreshing(false);
      return;
    }
    if (result === null) {
      setLoadError(true);
      setAssignments([]);
    } else {
      setAssignments(result);
    }
    setRefreshing(false);
  }, [token, signOut]);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setImpactCard(null);
        return undefined;
      }
      let cancelled = false;
      (async () => {
        const data = await fetchImpactCard(token);
        if (cancelled || !data) {
          return;
        }
        setImpactCard(data);
      })();
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  const dismissImpactUi = useCallback(async () => {
    if (!token) {
      return;
    }
    setImpactBusy(true);
    try {
      const u = await dismissImpactCardRequest(token);
      setImpactCard({ show: false });
      if (u) {
        await updateSessionUser(u);
      }
    } finally {
      setImpactBusy(false);
    }
  }, [token, updateSessionUser]);

  const onImpactBuildProfile = useCallback(async () => {
    navigation.navigate('Profile');
    await dismissImpactUi();
  }, [navigation, dismissImpactUi]);

  const openAssignmentSurvey = useCallback(
    async (a: MemberSurveyAssignment) => {
      if (!token) {
        return;
      }
      const idNum = Number(a.id);
      if (!Number.isFinite(idNum)) {
        return;
      }
      setOpeningAssignmentId(String(a.id));
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
          if (navigationRef.isReady()) {
            navigationRef.navigate('InternalSurvey', { assignmentId: idNum });
          }
          return;
        }
        const url = (res.data.survey_url || '').trim();
        if (url && /^https?:\/\//i.test(url)) {
          openSurveyUrl(url);
          return;
        }
        Alert.alert(t('survey.alertOpenFailedTitle'), t('survey.loadError'));
      } finally {
        setOpeningAssignmentId(null);
      }
    },
    [token, t],
  );

  const list = useMemo(() => assignments ?? [], [assignments]);
  const openList = useMemo(
    () => list.filter(a => !isAssignmentCompleted(a.status)),
    [list],
  );

  const surveyPreviewCap = 4;
  const surveysToShow =
    showAllSurveyRows || openList.length <= surveyPreviewCap
      ? openList
      : openList.slice(0, surveyPreviewCap);
  const hasMoreSurveyRows =
    openList.length > surveyPreviewCap && !showAllSurveyRows;

  const balanceXp = dummyRewardsSummary.availableBalance;

  const showImpactModal = impactCard?.show === true;
  const impactEstimated =
    showImpactModal && impactCard
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
          impactCard.estimated_value_cents / 100,
        )
      : '';
  const impactEarnings =
    showImpactModal && impactCard
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
          impactCard.earnings_today_cents / 100,
        )
      : '';

  return (
    <>
      <ScrollView
      style={styles.scrollRoot}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
          paddingBottom: insets.bottom + 28,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.balanceHero}>
        <View style={styles.balanceHeroInner}>
          <Text style={styles.balanceLabel}>{t('rewards.availableBalance')}</Text>
          <Text style={styles.balanceValue}>
            {balanceXp.toLocaleString()} {t('home.surveyMetaXp')}
          </Text>
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel={t('home.viewRewards')}
            style={styles.heroViewRewards}
            onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.heroViewRewardsText}>{t('home.viewRewards')}</Text>
          </AppPressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('home.surveysHeading')}</Text>

      {loading && assignments === null && !refreshing ? (
        <Text style={styles.mutedBody}>{t('home.surveysLoading')}</Text>
      ) : null}
      {loadError ? <Text style={styles.mutedBody}>{t('home.surveysLoadError')}</Text> : null}
      {!loading && !loadError && list.length === 0 ? (
        <Text style={styles.mutedBody}>{t('home.surveysEmpty')}</Text>
      ) : null}
      {!loading && !loadError && list.length > 0 && openList.length === 0 ? (
        <Text style={styles.mutedBody}>{t('home.noOpenSurveys')}</Text>
      ) : null}

      {surveysToShow.map(a => {
        const xp = Number(a.reward_points ?? 0);
        const busy = openingAssignmentId === String(a.id);
        const subtitle = t('home.surveyEstimatedTimeVaries');

        return (
          <AppPressable
            key={String(a.id)}
            accessibilityRole="button"
            accessibilityLabel={`${assignmentTitle(a, t)}, ${t('home.openSurveyA11y')}`}
            onPress={() => {
              if (isAssignmentCompleted(a.status) || busy) {
                return;
              }
              void openAssignmentSurvey(a);
            }}
            disabled={isAssignmentCompleted(a.status) || busy}
            style={[styles.surveyRow, busy ? { opacity: 0.7 } : null]}>
            <View style={styles.surveyTexts}>
              <Text style={styles.surveyTitle} numberOfLines={2}>
                {assignmentTitle(a, t)}
              </Text>
              <Text style={styles.surveySubtitle} numberOfLines={1}>
                {busy ? t('survey.openingStudy') : subtitle}
              </Text>
            </View>
            <Text style={styles.surveyXp}>
              {xp.toLocaleString()} {t('home.surveyMetaXp')}
            </Text>
          </AppPressable>
        );
      })}

      {hasMoreSurveyRows ? (
        <AppPressable
          style={styles.viewAllSurveysBtn}
          accessibilityRole="button"
          accessibilityLabel={t('home.viewAllSurveys')}
          onPress={() => setShowAllSurveyRows(true)}>
          <Text style={styles.viewAllSurveysText}>{t('home.viewAllSurveys')}</Text>
        </AppPressable>
      ) : null}
    </ScrollView>
      <Modal
        visible={showImpactModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          void dismissImpactUi();
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: 24,
          }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 10,
              }}>
              {t('onboarding.impactModalTitle')}
            </Text>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22,
                color: colors.textSecondary,
                marginBottom: 16,
              }}>
              {t('onboarding.impactModalBody')}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.label }}>
              {t('onboarding.impactModalEstimatedLabel')}
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.primary,
                marginBottom: 12,
                marginTop: 4,
              }}>
              {impactEstimated}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.label }}>
              {t('onboarding.impactModalStudyLabel')}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 20,
                marginTop: 4,
              }}>
              {impactEarnings}
            </Text>
            <AppPressable
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 10,
                opacity: impactBusy ? 0.75 : 1,
              }}
              onPress={() => {
                void onImpactBuildProfile();
              }}
              disabled={impactBusy}>
              <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>
                {t('onboarding.impactModalBuildProfile')}
              </Text>
            </AppPressable>
            <AppPressable
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => {
                void dismissImpactUi();
              }}
              disabled={impactBusy}>
              <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600' }}>
                {t('onboarding.impactModalLater')}
              </Text>
            </AppPressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
