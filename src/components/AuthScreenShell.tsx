import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
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
};

export function AuthScreenShell({
  children,
  logoWidth = 220,
  contentContainerStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        brand: {
          flex: BRAND_FLEX,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + 4,
          paddingHorizontal: 24,
        },
        lower: {
          flex: CARD_FLEX,
          minHeight: 260,
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
    [colors, insets.top, insets.bottom],
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
