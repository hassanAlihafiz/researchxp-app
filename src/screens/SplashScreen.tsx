import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme/ThemeContext';

const MIN_DISPLAY_MS = 1600;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: {
          alignItems: 'center',
          paddingHorizontal: 32,
        },
        titleRow: {
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 12,
        },
        mark: {
          fontSize: 40,
          fontWeight: '800',
          color: colors.text,
          letterSpacing: -0.5,
        },
        markAccent: {
          fontSize: 40,
          fontWeight: '800',
          color: colors.primary,
          letterSpacing: -0.5,
        },
        tagline: {
          fontSize: 16,
          color: colors.textMuted,
          marginBottom: 40,
          textAlign: 'center',
        },
        spinner: {
          marginTop: 8,
        },
      }),
    [colors],
  );

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (isSignedIn) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.replace('Login');
      }
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(id);
  }, [isSignedIn, navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.content, { opacity }]}>
        <View style={styles.titleRow}>
          <Text style={styles.mark}>ResearchXP</Text>
          <Text style={styles.markAccent}>AI</Text>
        </View>
        <Text style={styles.tagline}>Field research, simplified.</Text>
        <ActivityIndicator
          style={styles.spinner}
          color={colors.primary}
          size="large"
        />
      </Animated.View>
    </View>
  );
}
