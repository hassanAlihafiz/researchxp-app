import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resetPasswordWithCode } from '../../api/auth';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { PasswordField } from '../../components/PasswordField';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordNew'>;

export default function ForgotPasswordNewScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const email = (route.params?.email ?? '').trim().toLowerCase();
  const code = (route.params?.code ?? '').replace(/\D/g, '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!email || code.length !== 6) {
      navigation.replace('ForgotPasswordEmail');
    }
  }, [email, code, navigation]);

  if (!email || code.length !== 6) {
    return null;
  }

  const onSubmit = async () => {
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPasswordWithCode(email, code, password);
      if (!result.ok) {
        Alert.alert('Could not reset password', result.message);
        return;
      }
      Alert.alert('Password updated', result.message, [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell logoWidth={220}>
      <Text style={styles.title}>New password</Text>
      <Text style={styles.subtitle}>
        Choose a new password for{' '}
        <Text style={styles.emailHighlight}>{email}</Text>.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>New password</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          colors={colors}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Confirm password</Text>
        <PasswordField
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat password"
          colors={colors}
          editable={!loading}
        />
      </View>

      <AppPressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Update password</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <AppPressable
          onPress={() => navigation.navigate('ForgotPasswordCode', { email })}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>Back to code</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
}
