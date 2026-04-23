import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resendForgotPasswordCode } from '../../api/auth';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

const RESEND_COOLDOWN_SEC = 45;

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordCode'>;

export default function ForgotPasswordCodeScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const email = (route.params?.email ?? '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontSize: 28,
          fontWeight: '700',
          letterSpacing: -0.5,
          color: colors.text,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 26,
        },
        emailHighlight: {
          fontWeight: '700',
          color: colors.text,
        },
        field: { marginBottom: 18 },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          fontSize: 22,
          letterSpacing: 4,
          color: colors.text,
          backgroundColor: colors.inputBackground,
          textAlign: 'center',
        },
        button: {
          marginTop: 10,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
        },
        buttonDisabled: { opacity: 0.7 },
        buttonText: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '600',
        },
        secondaryBtn: {
          marginTop: 14,
          alignItems: 'center',
          paddingVertical: 12,
        },
        secondaryText: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
        },
        secondaryMuted: {
          fontSize: 14,
          color: colors.textMuted,
        },
        footer: {
          marginTop: 24,
          alignItems: 'center',
        },
        footerLink: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
        },
      }),
    [colors],
  );

  const tickResend = useCallback(() => {
    setResendCooldown(s => (s <= 1 ? 0 : s - 1));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }
    const id = setInterval(tickResend, 1000);
    return () => clearInterval(id);
  }, [resendCooldown, tickResend]);

  useEffect(() => {
    if (!email) {
      navigation.replace('ForgotPasswordEmail');
    }
  }, [email, navigation]);

  if (!email) {
    return null;
  }

  const onContinue = () => {
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your email.');
      return;
    }
    navigation.navigate('ForgotPasswordNew', { email, code: digits });
  };

  const onResend = async () => {
    if (resendCooldown > 0 || resendLoading) {
      return;
    }
    setResendLoading(true);
    try {
      const result = await resendForgotPasswordCode(email);
      if (!result.ok) {
        Alert.alert('Could not resend', result.message);
        return;
      }
      setResendCooldown(RESEND_COOLDOWN_SEC);
      Alert.alert('Code sent', 'Check your inbox for a new 6-digit code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthScreenShell logoWidth={220}>
      <Text style={styles.title}>Enter code</Text>
      <Text style={styles.subtitle}>
        We sent a reset code to{' '}
        <Text style={styles.emailHighlight}>{email}</Text>. Enter it below, then
        choose a new password.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Verification code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={colors.placeholder}
          editable={!resendLoading}
          autoFocus
        />
      </View>

      <AppPressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </AppPressable>

      <AppPressable
        style={styles.secondaryBtn}
        onPress={onResend}
        disabled={resendLoading || resendCooldown > 0}>
        {resendLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : resendCooldown > 0 ? (
          <Text style={styles.secondaryMuted}>Resend code in {resendCooldown}s</Text>
        ) : (
          <Text style={styles.secondaryText}>Resend code</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <AppPressable
          onPress={() => navigation.navigate('ForgotPasswordEmail')}
          hitSlop={12}>
          <Text style={styles.footerLink}>Use a different email</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
}
