import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';

const MIN_DISPLAY_MS = 1600;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;

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
          color="#3b82f6"
          size="large"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b0f14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  titleRow: {
    flexDirection: "column",
    alignItems: 'center',
    marginBottom: 12,

  },
  mark: {
    fontSize: 40,
    fontWeight: '800',
    color: '#f2f4f7',
    letterSpacing: -0.5,
  },
  markAccent: {
    fontSize: 40,
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7788',
    marginBottom: 40,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 8,
  },
});
