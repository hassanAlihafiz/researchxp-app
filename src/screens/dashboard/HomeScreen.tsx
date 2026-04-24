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
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>{t('home.screenTitle')}</Text>
      <Text style={styles.screenLead}>{t('home.screenLead')}</Text>

      <Text style={styles.overline}>{t('home.pointsOverview')}</Text>
      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.statAvailable')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.availableBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.statRedeemed')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.totalRedeemed.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('home.statInReview')}</Text>
          <Text style={styles.statValue}>
            {dummyRewardsSummary.underReview.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>{t('home.surveysHeading')}</Text>
      {dummySurveys.map(survey => (
        <View key={survey.id} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{survey.title}</Text>
          <Text style={styles.listCardMeta}>
            {survey.duration} • {survey.pointsAwarded.toLocaleString()}{' '}
            {t('home.surveyMetaPts')}
            {survey.dueIn ? t('home.surveyMetaDue', { when: survey.dueIn }) : ''}
          </Text>
        </View>
      ))}

      <Text style={[styles.paragraph, { marginTop: 8 }]}>
        {t('home.footerParagraph')}
      </Text>
      <Text style={styles.hint}>{t('home.footerHint')}</Text>
    </ScrollView>
  );
}
