import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerMenuButton } from './DrawerMenuButton';
import type { MainTabParamList } from './types';
import HomeScreen from '../screens/dashboard/HomeScreen';
import ExploreScreen from '../screens/dashboard/ExploreScreen';
import ActivityScreen from '../screens/dashboard/ActivityScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0b0f14' },
        headerTintColor: '#f2f4f7',
        headerTitleStyle: { fontWeight: '600', color: '#f2f4f7' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerLeft: () => <DrawerMenuButton />,
        tabBarStyle: {
          backgroundColor: '#121822',
          borderTopColor: '#2a3441',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7788',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⌂</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>◎</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>◇</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
