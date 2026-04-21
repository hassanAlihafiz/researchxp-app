import React, { useMemo } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createDashboardStyles } from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Help</Text>
      <Text style={styles.screenLead}>
        Find answers and reach the ResearchXP team when you need support in the
        field.
      </Text>

      <Text style={styles.sectionHeading}>Getting started</Text>
      <Text style={styles.paragraph}>
        Complete onboarding, check your rewards balance on the Home tab, and
        open surveys you are matched with. Use the drawer (☰) for Settings and
        this Help screen.
      </Text>

      <Text style={styles.sectionHeading}>FAQs</Text>
      <Text style={styles.paragraph}>
        Frequently asked questions will appear here—link to your knowledge base
        or embed summaries for common tasks (points, eligibility, survey
        completion).
      </Text>

      <Text style={styles.sectionHeading}>Contact</Text>
      <Text style={styles.paragraphLast}>
        Add support email, phone, or in-app chat when your support channels are
        ready.
      </Text>
    </ScrollView>
  );
}
