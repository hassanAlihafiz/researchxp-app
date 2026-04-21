import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { useAuth } from '../../auth/AuthContext';
import { resetToLogin } from '../../navigation/navigationRef';
import type { MainDrawerParamList } from '../../navigation/types';
import type { ColorScheme } from '../../theme/palettes';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email, signOut } = useAuth();
  const { colors, colorScheme, setColorScheme } = useAppTheme();

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
          marginBottom: 24,
        },
        sectionLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        themeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: 10,
          rowGap: 10,
          marginBottom: 28,
        },
        themeChip: {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        themeChipActive: {
          borderColor: colors.primary,
          backgroundColor: colors.chipSelectedBackground,
        },
        themeChipText: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.textSecondary,
        },
        themeChipTextActive: {
          color: colors.primary,
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
          marginBottom: 32,
        },
        button: {
          alignSelf: 'flex-start',
          backgroundColor: colors.buttonSecondary,
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: colors.buttonSecondaryBorder,
        },
        buttonText: {
          color: colors.buttonSecondaryText,
          fontSize: 15,
          fontWeight: '600',
        },
      }),
    [colors],
  );

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
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionLabel}>Appearance</Text>
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

      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email}</Text>
      <Pressable style={styles.button} onPress={onSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
