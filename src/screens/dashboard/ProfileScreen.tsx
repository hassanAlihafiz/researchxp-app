import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../auth/AuthContext';
import type { MainTabParamList } from '../../navigation/types';
import { createDashboardStyles } from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export default function ProfileScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email } = useAuth();
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
      <Text style={styles.screenTitle}>Profile</Text>
      <Text style={styles.screenLead}>
        Your participant identity and preferences will appear here as the app
        connects to your ResearchXP account.
      </Text>

      <Text style={styles.overline}>Account</Text>
      <View style={styles.elevatedBlock}>
        <Text style={styles.fieldLabel}>Email</Text>
        <Text style={styles.fieldValue}>{email ?? '—'}</Text>
      </View>

      <Text style={styles.sectionHeading}>Coming soon</Text>
      <Text style={styles.paragraphLast}>
        Demographics, notification settings, and verification status will live
        in this section once wired to the backend.
      </Text>
    </ScrollView>
  );
}
