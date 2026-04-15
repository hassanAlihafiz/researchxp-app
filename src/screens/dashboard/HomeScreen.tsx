import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../auth/AuthContext';
import type { MainTabParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Signed in as</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.hint}>
        Tap ☰ in the header to open the drawer (Settings, Help). Use the bottom
        tabs to switch sections.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#0b0f14',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f2f4f7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7788',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#9aa4b2',
    marginBottom: 24,
  },
  hint: {
    fontSize: 14,
    color: '#6b7788',
    lineHeight: 21,
  },
});
