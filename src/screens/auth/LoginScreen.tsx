import React, { useMemo, useState } from 'react';
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
import { loginWithPassword, resendVerificationEmail } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { PasswordField } from '../../components/PasswordField';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

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
      }),
    [colors],
  );

  const goToVerify = (addr: string) => {
    navigation.navigate('VerifyEmail', { email: addr });
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const result = await loginWithPassword(email, password);
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
        const trimmed = email.trim().toLowerCase();
        const resend = await resendVerificationEmail(trimmed);
        if (!resend.ok) {
          Alert.alert(
            'Email not verified',
            `We could not send a new code: ${resend.message}. You can try “Resend code” on the next screen.`,
            [{ text: 'OK', onPress: () => goToVerify(trimmed) }],
          );
          return;
        }
        goToVerify(trimmed);
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
        Sign in with your ResearchXP account. You must verify your email before
        you can use the app.
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
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to ResearchXP?</Text>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>Create an account</Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
};

export default LoginScreen;
