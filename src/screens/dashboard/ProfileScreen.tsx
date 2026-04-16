import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../auth/AuthContext';
import type { MainTabParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export default function ProfileScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email } = useAuth();
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
          marginBottom: 16,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 4,
        },
        email: {
          fontSize: 16,
          color: colors.text,
          marginBottom: 24,
        },
        body: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.body}>
        Account details and preferences will live here. Use ☰ in the header for
        Settings and Help.
      </Text>
    </View>
  );
}
