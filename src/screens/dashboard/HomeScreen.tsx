import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsSummary, dummySurveys } from '../../data/dummyData';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen(_props: Props) {
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
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
        },
        cardsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -6,
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
        body: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 20,
        },
        hint: {
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 21,
        },
        surveyCard: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
        },
        surveyTitle: {
          fontSize: 16,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 6,
        },
        surveyMeta: {
          fontSize: 13,
          color: colors.textSecondary,
        },
      }),
    [colors],
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Rewards</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Available Points</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Redeemed</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Under Review</Text>
          <Text style={styles.cardValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>Surveys</Text>
      {dummySurveys.map(survey => (
        <View key={survey.id} style={styles.surveyCard}>
          <Text style={styles.surveyTitle}>{survey.title}</Text>
          <Text style={styles.surveyMeta}>
            {survey.duration} • {survey.pointsAwarded.toLocaleString()} pts
            {survey.dueIn ? ` • Due in ${survey.dueIn}` : ''}
          </Text>
        </View>
      ))}
      <Text style={styles.body}>
        Surveys you are matched with will appear here so you can conduct them in
        the field. Use the Rewards and Profile tabs for incentives and your
        account.
      </Text>
      <Text style={styles.hint}>
        Tap ☰ in the header to open Settings and Help.
      </Text>
    </ScrollView>
  );
}
