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
import { loginWithPassword, resendVerificationEmail } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { PasswordField } from '../../components/PasswordField';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

const LoginScreen = ({ navigation }: Props) => {
  const { colors } = useAppTheme();
  const { signInWithSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        buttonDisabled: {
          opacity: 0.7,
        },
        buttonText: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '600',
        },
        footer: {
          marginTop: 28,
          alignItems: 'center',
          paddingBottom: 4,
        },
        footerText: {
          fontSize: 15,
          color: colors.textSecondary,
        },
        footerLink: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
          marginTop: 6,
        },
        forgotRow: {
          alignSelf: 'flex-end',
          marginTop: 4,
          marginBottom: 2,
        },
        forgotLink: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
        },
      }),
    [colors],
  );

  const goToVerify = (addr: string) => {
    navigation.navigate('VerifyEmail', { email: addr });
  };

  const onSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password required', 'Enter your password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      Alert.alert(
        'Invalid password',
        `Password must be at least ${MIN_PASSWORD_LEN} characters.`,
      );
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(trimmedEmail, password);
      if (result.ok) {
        const addr = result.user.email.trim().toLowerCase();
        await signInWithSession({
          email: addr,
          token: result.token,
          user: result.user,
        });
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        return;
      }

      if (result.needsVerification) {
        const resend = await resendVerificationEmail(trimmedEmail);
        if (!resend.ok) {
          Alert.alert(
            'Email not verified',
            `We could not send a new code: ${resend.message}. You can try “Resend code” on the next screen.`,
            [{ text: 'OK', onPress: () => goToVerify(trimmedEmail) }],
          );
          return;
        }
        goToVerify(trimmedEmail);
        return;
      }

      Alert.alert('Sign in failed', result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell logoWidth={220}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Sign in with your ResearchXP account.
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

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          colors={colors}
          editable={!loading}
        />
        <AppPressable
          style={styles.forgotRow}
          onPress={() => navigation.navigate('ForgotPasswordEmail')}
          disabled={loading}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel="Forgot password">
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </AppPressable>
      </View>

      <AppPressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to ResearchXP?</Text>
        <AppPressable
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>Create an account</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
};

export default LoginScreen;
