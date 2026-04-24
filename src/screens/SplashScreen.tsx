import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { ResearchLogo } from '../components/ResearchLogo';
import type { RootStackParamList } from '../navigation/types';
import { useLocale } from '../locale';
import { useAppTheme } from '../theme/ThemeContext';

const MIN_DISPLAY_MS = 1600;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isSignedIn, ready } = useAuth();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const opacity = useRef(new Animated.Value(0)).current;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        contentContainer: {
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: {
          alignItems: 'center',
          paddingHorizontal: 32,
        },
        logo: {
          marginBottom: 20,
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
    if (!ready) {
      return undefined;
    }
    const id = setTimeout(() => {
      if (isSignedIn) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.replace('Login');
      }
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(id);
  }, [ready, isSignedIn, navigation]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
      ]}
      showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity }]}>
        <ResearchLogo width={280} containerStyle={styles.logo} />
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
        <ActivityIndicator
          style={styles.spinner}
          color={colors.primary}
          size="large"
        />
      </Animated.View>
    </ScrollView>
  );
}
