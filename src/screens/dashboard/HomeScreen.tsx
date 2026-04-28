import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { createHomeStyles } from './createHomeStyles';

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
  const { token, signOut } = useAuth();
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

  return (
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
        const url = (a.survey_url || '').trim();
        const canOpen = Boolean(url && /^https?:\/\//i.test(url));
        const subtitle = t('home.surveyEstimatedTimeVaries');

        return (
          <AppPressable
            key={String(a.id)}
            accessibilityRole={canOpen ? 'button' : undefined}
            accessibilityLabel={
              canOpen
                ? `${assignmentTitle(a, t)}, ${t('home.openSurveyA11y')}`
                : assignmentTitle(a, t)
            }
            onPress={() => {
              if (canOpen) {
                openSurveyUrl(url);
              }
            }}
            style={styles.surveyRow}>
            <View style={styles.surveyTexts}>
              <Text style={styles.surveyTitle} numberOfLines={2}>
                {assignmentTitle(a, t)}
              </Text>
              <Text style={styles.surveySubtitle} numberOfLines={1}>
                {subtitle}
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
  );
}
