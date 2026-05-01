import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import { MainDrawerNavigator } from './MainDrawerNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import EmailSignUpScreen from '../screens/auth/EmailSignUpScreen';
import Layer0OnboardingScreen from '../screens/onboarding/Layer0OnboardingScreen';
import ValuePrimerScreen from '../screens/onboarding/ValuePrimerScreen';
import WelcomeRewardScreen from '../screens/onboarding/WelcomeRewardScreen';
import ForgotPasswordEmailScreen from '../screens/auth/ForgotPasswordEmailScreen';
import ForgotPasswordCodeScreen from '../screens/auth/ForgotPasswordCodeScreen';
import ForgotPasswordNewScreen from '../screens/auth/ForgotPasswordNewScreen';
import SplashScreen from '../screens/SplashScreen';
import InternalSurveyScreen from '../screens/survey/InternalSurveyScreen';
import { useAppTheme } from '../theme/ThemeContext';
import { appLog } from '../utils/appLog';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors, navigationTheme } = useAppTheme();

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '600' as const, color: colors.text },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onStateChange={() => {
        if (navigationRef.isReady()) {
          const r = navigationRef.getCurrentRoute();
          if (r) {
            appLog('nav', 'screen', { name: r.name, params: r.params });
          }
        }
      }}
    >
      <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailSignUp"
          component={EmailSignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingLayer0"
          component={Layer0OnboardingScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="OnboardingValuePrimer"
          component={ValuePrimerScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="OnboardingWelcomeReward"
          component={WelcomeRewardScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasswordEmail"
          component={ForgotPasswordEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasswordCode"
          component={ForgotPasswordCodeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasswordNew"
          component={ForgotPasswordNewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainDrawerNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="InternalSurvey"
          component={InternalSurveyScreen}
          options={{
            title: 'Study',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
