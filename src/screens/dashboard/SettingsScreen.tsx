import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { MainDrawerParamList } from '../../navigation/types';
import type { ColorScheme } from '../../theme/palettes';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorScheme, setColorScheme } = useAppTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const selectScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Settings</Text>
      <Text style={styles.screenLead}>
        Choose light or dark appearance for the app.
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
    </ScrollView>
  );
}
