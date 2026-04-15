import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { useAuth } from '../../auth/AuthContext';
import { resetToLogin } from '../../navigation/navigationRef';
import type { MainDrawerParamList } from '../../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { email, signOut } = useAuth();

  const onSignOut = () => {
    signOut();
    resetToLogin();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email}</Text>
      <Pressable style={styles.button} onPress={onSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
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
    fontSize: 22,
    fontWeight: '700',
    color: '#f2f4f7',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7788',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#f2f4f7',
    marginBottom: 32,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonText: {
    color: '#f2f4f7',
    fontSize: 15,
    fontWeight: '600',
  },
});
