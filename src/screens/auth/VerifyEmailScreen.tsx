import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  resendVerificationEmail,
  verifyEmailWithCode,
} from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const RESEND_COOLDOWN_SEC = 45;

const VerifyEmailScreen = ({ navigation, route }: Props) => {
  const { colors } = useAppTheme();
  const { signInWithSession } = useAuth();
  const email = (route.params?.email ?? '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontSize: 28,
          fontWeight: '800',
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
        field: {
          marginBottom: 18,
        },
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
        buttonDisabled: {
          opacity: 0.7,
        },
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
          paddingBottom: 4,
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
    setResendCooldown(s => {
      if (s <= 1) {
        return 0;
      }
      return s - 1;
    });
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
      navigation.replace('Login');
    }
  }, [email, navigation]);

  if (!email) {
    return null;
  }

  const onVerify = async () => {
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyEmailWithCode(email, digits);
      if (!result.ok) {
        Alert.alert('Verification failed', result.message);
        return;
      }
      await signInWithSession({
        email: result.user.email.trim().toLowerCase(),
        token: result.token,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (resendCooldown > 0 || resendLoading) {
      return;
    }
    setResendLoading(true);
    try {
      const result = await resendVerificationEmail(email);
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
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{' '}
        <Text style={styles.emailHighlight}>{email}</Text>. Enter it below to
        activate your account.
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
          editable={!loading}
          autoFocus
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onVerify}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Verify and continue</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.secondaryBtn}
        onPress={onResend}
        disabled={resendLoading || resendCooldown > 0 || loading}>
        {resendLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : resendCooldown > 0 ? (
          <Text style={styles.secondaryMuted}>
            Resend code in {resendCooldown}s
          </Text>
        ) : (
          <Text style={styles.secondaryText}>Resend code</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>Back to sign in</Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
};

export default VerifyEmailScreen;
