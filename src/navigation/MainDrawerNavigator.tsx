import React from 'react';
import {
  createDrawerNavigator,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import type { MainDrawerParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import HelpScreen from '../screens/dashboard/HelpScreen';
import SettingsScreen from '../screens/dashboard/SettingsScreen';


const Drawer = createDrawerNavigator<MainDrawerParamList>();

export function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'Tabs',
        headerStyle: { backgroundColor: '#0b0f14' },
        headerTintColor: '#f2f4f7',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        headerLeft: () => <DrawerToggleButton tintColor="#f2f4f7" />,
        drawerStyle: { backgroundColor: '#121822' },
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: '#9aa4b2',
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
