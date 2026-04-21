import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsActivity, dummyRewardsSummary } from '../../data/dummyData';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Rewards'>;

export default function RewardsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        },
        title: {
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        cardsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -6,
          marginTop: 12,
          marginBottom: 20,
        },
        card: {
          flexGrow: 1,
          flexBasis: '30%',
          minWidth: 120,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 12,
          marginHorizontal: 6,
          marginVertical: 6,
        },
        cardLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          letterSpacing: 0.4,
          marginBottom: 8,
        },
        cardValue: {
          fontSize: 18,
          fontWeight: '800',
          color: colors.text,
        },
        sectionLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginBottom: 10,
        },
        activityRow: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
        },
        activityTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 6,
        },
        activityTitle: {
          flex: 1,
          fontSize: 15,
          fontWeight: '800',
          color: colors.text,
        },
        activityDelta: {
          fontSize: 15,
          fontWeight: '800',
        },
        activityMeta: {
          fontSize: 13,
          color: colors.textSecondary,
        },
        body: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
        },
      }),
    [colors],
  );

  const deltaColorFor = (points: number) => {
    if (points > 0) return colors.primary;
    if (points < 0) return colors.text;
    return colors.textSecondary;
  };

  const statusLabelFor = (status: (typeof dummyRewardsActivity)[number]['status']) => {
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending';
    return 'Under review';
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.body}>
        Track points and incentives you earn from completed surveys.
      </Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Available balance</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total redeemed</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Under review</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Recent activity</Text>
      {dummyRewardsActivity.map(item => (
        <View key={item.id} style={styles.activityRow}>
          <View style={styles.activityTop}>
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
          <Text style={styles.activityMeta}>
            {item.date} • {statusLabelFor(item.status)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
