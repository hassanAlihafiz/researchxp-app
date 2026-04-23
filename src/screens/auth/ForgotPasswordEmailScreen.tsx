import React, { useMemo, useState } from 'react';
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
import { requestForgotPassword } from '../../api/auth';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordEmail'>;

export default function ForgotPasswordEmailScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
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
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
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
          marginTop: 28,
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

  const onSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await requestForgotPassword(trimmed);
      if (!result.ok) {
        Alert.alert('Request failed', result.message);
        return;
      }
      navigation.navigate('ForgotPasswordCode', { email: trimmed });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell logoWidth={220}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>
        Enter the email for your ResearchXP account. If it exists, we will send a
        6-digit code valid for 15 minutes.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@company.com"
          placeholderTextColor={colors.placeholder}
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
          <Text style={styles.buttonText}>Send code</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <AppPressable onPress={() => navigation.navigate('Login')} disabled={loading} hitSlop={12}>
          <Text style={styles.footerLink}>Back to sign in</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
}
