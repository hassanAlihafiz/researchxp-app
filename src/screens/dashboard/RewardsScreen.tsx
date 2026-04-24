import React, { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsActivity, dummyRewardsSummary } from '../../data/dummyData';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Rewards'>;

export default function RewardsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const deltaColorFor = (points: number) => {
    if (points > 0) {
      return colors.primary;
    }
    if (points < 0) {
      return colors.text;
    }
    return colors.textSecondary;
  };

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

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>{t('rewards.screenTitle')}</Text>
      <Text style={styles.screenLead}>{t('rewards.screenLead')}</Text>

      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('rewards.availableBalance')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('rewards.totalRedeemed')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('rewards.underReview')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.overline}>{t('rewards.recentActivity')}</Text>
      {dummyRewardsActivity.map(item => (
        <View key={item.id} style={styles.listCard}>
          <View style={styles.activityRowTop}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text
              style={[
                styles.activityDelta,
                { color: deltaColorFor(item.points) },
              ]}>
              {item.points > 0 ? '+' : ''}
              {item.points.toLocaleString()} {t('rewards.ptsSuffix')}
            </Text>
          </View>
          <Text style={styles.listCardMeta}>
            {item.date} • {statusLabelFor(item.status)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
