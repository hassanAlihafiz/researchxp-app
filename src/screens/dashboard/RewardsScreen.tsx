import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsActivity, dummyRewardsSummary } from '../../data/dummyData';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Rewards'>;

export default function RewardsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
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

  const statusLabelFor = (
    status: (typeof dummyRewardsActivity)[number]['status'],
  ) => {
    if (status === 'completed') {
      return 'Completed';
    }
    if (status === 'pending') {
      return 'Pending';
    }
    return 'Under review';
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Rewards</Text>
      <Text style={styles.screenLead}>
        Track points and incentives you earn from completed surveys.
      </Text>

      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available balance</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total redeemed</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Under review</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.overline}>Recent activity</Text>
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
              {item.points.toLocaleString()} pts
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
