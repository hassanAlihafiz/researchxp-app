import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { MainDrawerParamList } from './types';
import { useAppTheme } from '../theme/ThemeContext';

/**
 * Opens the app drawer. Uses a text glyph so the control stays visible across
 * themes (vector-based DrawerToggleButton can fail to render in some setups).
 */
export function DrawerMenuButton() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const onPress = useCallback(() => {
    const nav = navigation as DrawerNavigationProp<MainDrawerParamList> & {
      openDrawer?: () => void;
    };
    if (typeof nav.openDrawer === 'function') {
      nav.openDrawer();
      return;
    }
    const parent =
      navigation.getParent<DrawerNavigationProp<MainDrawerParamList>>();
    if (parent && typeof parent.openDrawer === 'function') {
      parent.openDrawer();
      return;
    }
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu">
      <Text style={[styles.icon, { color: colors.text }]}>☰</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    fontWeight: '600',
  },
});
