import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MainDrawerContent } from './MainDrawerContent';
import type { MainDrawerParamList } from './types';
import { DrawerMenuButton } from './DrawerMenuButton';
import { MainTabNavigator } from './MainTabNavigator';
import HelpScreen from '../screens/dashboard/HelpScreen';
import SettingsScreen from '../screens/dashboard/SettingsScreen';
import { dashboardHeaderTitleStyle } from '../theme/dashboardStyles';
import { useAppTheme } from '../theme/ThemeContext';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export function MainDrawerNavigator() {
  const { colors } = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <MainDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'Tabs',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: dashboardHeaderTitleStyle(colors),
        headerShadowVisible: false,
        headerLeft: () => <DrawerMenuButton />,
        drawerStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: { fontWeight: '600' },
        drawerType: 'front',
      })}>
      <Drawer.Screen
        name="Tabs"
        component={MainTabNavigator}
        options={{ title: 'Home', drawerLabel: 'Home' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', drawerLabel: 'Settings' }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Help', drawerLabel: 'Help' }}
      />
    </Drawer.Navigator>
  );
}
