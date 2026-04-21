import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { useAuth } from '../../auth/AuthContext';
import { resetToLogin } from '../../navigation/navigationRef';
import type { MainDrawerParamList } from '../../navigation/types';
import type { ColorScheme } from '../../theme/palettes';
import { createDashboardStyles } from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email, signOut } = useAuth();
  const { colors, colorScheme, setColorScheme } = useAppTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const onSignOut = () => {
    signOut();
    resetToLogin();
  };

  const selectScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Settings</Text>
      <Text style={styles.screenLead}>
        Appearance and session. Changes apply across the app immediately.
      </Text>

      <Text style={styles.overline}>Appearance</Text>
      <View style={styles.themeRow}>
        <Pressable
          onPress={() => selectScheme('light')}
          style={[
            styles.themeChip,
            colorScheme === 'light' && styles.themeChipActive,
          ]}>
          <Text
            style={[
              styles.themeChipText,
              colorScheme === 'light' && styles.themeChipTextActive,
            ]}>
            Light
          </Text>
        </Pressable>
        <Pressable
          onPress={() => selectScheme('dark')}
          style={[
            styles.themeChip,
            colorScheme === 'dark' && styles.themeChipActive,
          ]}>
          <Text
            style={[
              styles.themeChipText,
              colorScheme === 'dark' && styles.themeChipTextActive,
            ]}>
            Dark
          </Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <Text style={styles.overline}>Session</Text>
      <View style={styles.elevatedBlock}>
        <Text style={styles.fieldLabel}>Signed in as</Text>
        <Text style={styles.fieldValue}>{email ?? '—'}</Text>
      </View>

      <Pressable style={styles.buttonSecondary} onPress={onSignOut}>
        <Text style={styles.buttonSecondaryText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
