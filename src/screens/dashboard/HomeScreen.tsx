import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { dummyRewardsSummary, dummySurveys } from '../../data/dummyData';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Home</Text>
      <Text style={styles.screenLead}>
        Your field workspace: points, surveys, and quick access to settings.
      </Text>

      <Text style={styles.overline}>Points overview</Text>
      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Redeemed</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>In review</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Surveys</Text>
      {dummySurveys.map(survey => (
        <View key={survey.id} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{survey.title}</Text>
          <Text style={styles.listCardMeta}>
            {survey.duration} • {survey.pointsAwarded.toLocaleString()} pts
            {survey.dueIn ? ` • Due in ${survey.dueIn}` : ''}
          </Text>
        </View>
      ))}

      <Text style={[styles.paragraph, { marginTop: 8 }]}>
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
