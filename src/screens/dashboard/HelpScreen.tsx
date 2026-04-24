import React, { useMemo } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

export default function HelpScreen() {
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
      <Text style={styles.screenTitle}>{t('help.screenTitle')}</Text>
      <Text style={styles.screenLead}>{t('help.screenLead')}</Text>

      <Text style={styles.sectionHeading}>{t('help.gettingStarted')}</Text>
      <Text style={styles.paragraph}>{t('help.gettingStartedBody')}</Text>

      <Text style={styles.sectionHeading}>{t('help.faqs')}</Text>
      <Text style={styles.paragraph}>{t('help.faqsBody')}</Text>

      <Text style={styles.sectionHeading}>{t('help.contact')}</Text>
      <Text style={styles.paragraphLast}>{t('help.contactBody')}</Text>
    </ScrollView>
  );
}
