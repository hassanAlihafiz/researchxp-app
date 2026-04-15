import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { MainDrawerParamList } from './types';

/**
 * Opens the parent drawer from screens nested under a bottom-tab navigator.
 * DrawerToggleButton often renders nothing here; use the drawer API instead.
 */
export function DrawerMenuButton() {
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    const drawer = navigation.getParent<DrawerNavigationProp<MainDrawerParamList>>();
    if (drawer) {
      drawer.openDrawer();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, [navigation]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu">
      <Text style={styles.icon}>☰</Text>
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
    color: '#f2f4f7',
    fontSize: 22,
    fontWeight: '600',
  },
});
