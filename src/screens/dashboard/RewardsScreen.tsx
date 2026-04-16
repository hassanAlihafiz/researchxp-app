import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Rewards'>;

export default function RewardsScreen(_props: Props) {
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
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
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
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.body}>
        Track points and incentives you earn from completed surveys. This section
        will be wired up as your rewards program is defined.
      </Text>
    </View>
  );
}
