import React, { useMemo } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MainDrawerContent } from './MainDrawerContent';
import type { MainDrawerParamList } from './types';
import { DrawerMenuButton } from './DrawerMenuButton';
import { MainTabNavigator } from './MainTabNavigator';
import HelpScreen from '../screens/dashboard/HelpScreen';
import SettingsScreen from '../screens/dashboard/SettingsScreen';
import { useLocale } from '../locale';
import { dashboardHeaderTitleStyle } from '../theme/dashboardStyles';
import { useAppTheme } from '../theme/ThemeContext';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export function MainDrawerNavigator() {
  const { colors } = useAppTheme();
  const { t, language } = useLocale();

  const screenOptions = useMemo(
    () =>
      function drawerScreenOptions({
        route,
      }: {
        route: { name: keyof MainDrawerParamList };
      }) {
        const drawerTitle =
          route.name === 'Tabs'
            ? t('nav.drawerHome')
            : route.name === 'Settings'
              ? t('nav.drawerSettings')
              : t('nav.drawerHelp');
        return {
          headerShown: route.name !== 'Tabs',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: dashboardHeaderTitleStyle(colors),
          headerShadowVisible: false,
          headerLeft: () => <DrawerMenuButton />,
          drawerStyle: { backgroundColor: colors.drawerBackground },
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.textSecondary,
          drawerLabelStyle: { fontWeight: '600' as const },
          drawerType: 'front' as const,
          title: drawerTitle,
          drawerLabel: drawerTitle,
        };
      },
    [colors, language, t], // eslint-disable-line react-hooks/exhaustive-deps -- drawer titles follow locale
  );

  return (
    <Drawer.Navigator
      drawerContent={props => <MainDrawerContent {...props} />}
      screenOptions={screenOptions}>
      <Drawer.Screen name="Tabs" component={MainTabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}
