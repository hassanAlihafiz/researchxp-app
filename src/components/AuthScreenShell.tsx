import React, { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResearchLogo } from './ResearchLogo';
import { useAppTheme } from '../theme/ThemeContext';

/** ~45% : ~55% split (reference layout). */
const BRAND_FLEX = 9;
const CARD_FLEX = 11;

const CARD_TOP_RADIUS = 28;

type Props = {
  children: React.ReactNode;
  logoWidth?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** For scroll-to-focused-field (e.g. Register). */
  scrollViewRef?: RefObject<ScrollView | null>;
  onScrollViewLayout?: (event: LayoutChangeEvent) => void;
};

export function AuthScreenShell({
  children,
  logoWidth = 220,
  contentContainerStyle,
  scrollViewRef,
  onScrollViewLayout,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        brand: {
          flex: keyboardOpen ? 0 : BRAND_FLEX,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: keyboardOpen ? 0 : insets.top + 4,
          paddingHorizontal: 24,
          minHeight: 0,
          overflow: 'hidden',
          opacity: keyboardOpen ? 0 : 1,
          ...(keyboardOpen
            ? { height: 0, paddingHorizontal: 0 }
            : {}),
        },
        lower: {
          flex: keyboardOpen ? 1 : CARD_FLEX,
          minHeight: keyboardOpen ? 0 : 260,
          paddingTop: keyboardOpen ? insets.top : 0,
        },
        keyboard: {
          flex: 1,
        },
        card: {
          flex: 1,
          backgroundColor: colors.surface,
          borderTopLeftRadius: CARD_TOP_RADIUS,
          borderTopRightRadius: CARD_TOP_RADIUS,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderRightWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: 0,
          borderColor: colors.border,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
            },
            android: {
              elevation: 10,
            },
          }),
        },
        scrollContent: {
          paddingHorizontal: 24,
          paddingTop: 28,
          /** Extra space so the last field can scroll above the keyboard (Register, etc.). */
          paddingBottom: Math.max(insets.bottom, 24) + 48,
          flexGrow: 1,
        },
      }),
    [colors, insets.top, insets.bottom, keyboardOpen],
  );

  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <ResearchLogo width={logoWidth} />
      </View>
      <View style={styles.lower}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.card}>
            <ScrollView
              ref={scrollViewRef}
              onLayout={onScrollViewLayout}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
