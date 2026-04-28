import React, { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsActivity, dummyRewardsSummary } from '../../data/dummyData';
import { createHomeStyles } from './createHomeStyles';
import { DASHBOARD_SCROLL_PADDING_TOP } from '../../theme/dashboardStyles';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';
import type { AppPalette } from '../../theme/palettes';

type Props = BottomTabScreenProps<MainTabParamList, 'Rewards'>;

function activityDeltaStyle(colors: AppPalette, points: number): { color: string } {
  if (points > 0) {
    return { color: colors.primary };
  }
  if (points < 0) {
    return { color: colors.text };
  }
  return { color: colors.textMuted };
}

export default function RewardsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorScheme } = useAppTheme();
  const { t } = useLocale();
  const styles = useMemo(
    () => createHomeStyles(colors, colorScheme),
    [colors, colorScheme],
  );
  const statusLabelFor = useCallback(
    (status: (typeof dummyRewardsActivity)[number]['status']) => {
      if (status === 'completed') {
        return t('rewards.statusCompleted');
      }
      if (status === 'pending') {
        return t('rewards.statusPending');
      }
      return t('rewards.statusUnderReview');
    },
    [t],
  );

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
      showsVerticalScrollIndicator={false}>
      <View style={styles.balanceHero}>
        <View style={styles.balanceHeroInner}>
          <Text style={styles.balanceLabel}>{t('rewards.availableBalance')}</Text>
          <Text style={[styles.balanceValue, styles.balanceValueRewardsHeroOnly]}>
            {balanceXp.toLocaleString()} {t('rewards.xpSuffix')}
          </Text>
        </View>
        <View style={styles.balanceHeroStatsRow}>
          <View style={styles.balanceHeroStat}>
            <Text style={styles.balanceHeroStatLabel}>{t('rewards.totalRedeemed')}</Text>
            <Text style={styles.balanceHeroStatValue}>
              {dummyRewardsSummary.totalRedeemed.toLocaleString()}
            </Text>
          </View>
          <View style={styles.balanceHeroStat}>
            <Text style={styles.balanceHeroStatLabel}>{t('rewards.underReview')}</Text>
            <Text style={styles.balanceHeroStatValue}>
              {dummyRewardsSummary.underReview.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('rewards.recentActivity')}</Text>

      {dummyRewardsActivity.map(item => (
        <View key={item.id} style={styles.surveyRow}>
          <View style={styles.surveyTexts}>
            <Text style={styles.surveyTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.surveySubtitle} numberOfLines={2}>
              {item.date} • {statusLabelFor(item.status)}
            </Text>
          </View>
          <Text
            style={[
              styles.surveyXp,
              activityDeltaStyle(colors, item.points),
            ]}>
            {item.points > 0 ? '+' : ''}
            {item.points.toLocaleString()} {t('rewards.xpSuffix')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
