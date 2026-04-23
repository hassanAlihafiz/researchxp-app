import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppPressable } from '../components/AppPressable';
import { useAuth } from '../auth/AuthContext';
import { resetToLogin } from './navigationRef';
import { useAppTheme } from '../theme/ThemeContext';

export function MainDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { email, signOut } = useAuth();

  const onSignOut = async () => {
    props.navigation.closeDrawer();
    await signOut();
    resetToLogin();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.drawerBackground,
        },
        scroll: {
          flex: 1,
        },
        footer: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          backgroundColor: colors.drawerBackground,
        },
        emailLine: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 10,
          paddingHorizontal: 4,
        },
        signOutBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 4,
        },
        signOutIconWrap: {
          marginRight: 10,
        },
        signOutLabel: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 4 }}
        showsVerticalScrollIndicator={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <AppPressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.65 }]}
          onPress={onSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out">
          <View style={styles.signOutIconWrap}>
            <Ionicons name="log-out-outline" size={22} color={colors.text} />
          </View>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </AppPressable>
      </View>
    </View>
  );
}
