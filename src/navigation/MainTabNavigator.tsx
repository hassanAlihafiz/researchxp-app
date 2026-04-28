import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppPressable } from '../components/AppPressable';
import type { MainTabParamList } from './types';
import HomeScreen from '../screens/dashboard/HomeScreen';
import RewardsScreen from '../screens/dashboard/RewardsScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import {
  MainTabHeaderLeading,
  MainTabHeaderTrailing,
} from './MainTabHeader';
import { useLocale } from '../locale';
import { dashboardHeaderTitleStyle } from '../theme/dashboardStyles';
import { useAppTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 24;

function MainTabHeaderLeftBridge() {
  return <MainTabHeaderLeading />;
}

function MainTabHeaderRightBridge() {
  return <MainTabHeaderTrailing />;
}

function TabBarButton(props: BottomTabBarButtonProps) {
  return <AppPressable {...props} />;
}

export function MainTabNavigator() {
  const { colors } = useAppTheme();
  const { t, language } = useLocale();

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.background,
        paddingBottom: 10,
      },
      headerTintColor: colors.text,
      headerTitleStyle: dashboardHeaderTitleStyle(colors),
      headerShadowVisible: false,
      headerTitleAlign: 'center' as const,
      tabBarStyle: {
        backgroundColor: colors.tabBar,
        borderTopColor: colors.tabBarBorder,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500' as const },
      tabBarButton: TabBarButton,
    }),
    [colors, language, t], // eslint-disable-line react-hooks/exhaustive-deps -- tab labels follow locale
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '',
          headerTitle: () => null,
          headerLeft: MainTabHeaderLeftBridge,
          headerRight: MainTabHeaderRightBridge,
          tabBarLabel: t('nav.tabHome'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          title: '',
          headerTitle: () => null,
          headerLeft: MainTabHeaderLeftBridge,
          headerRight: MainTabHeaderRightBridge,
          tabBarLabel: t('nav.tabRewards'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'gift' : 'gift-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '',
          headerTitle: () => null,
          headerLeft: MainTabHeaderLeftBridge,
          headerRight: MainTabHeaderRightBridge,
          tabBarLabel: t('nav.tabProfile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
