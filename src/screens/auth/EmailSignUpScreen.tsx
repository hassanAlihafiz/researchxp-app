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
import { registerMemberMinimal } from '../../api/registerMember';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { PasswordField } from '../../components/PasswordField';
import type { RootStackParamList } from '../../navigation/types';
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailSignUp'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export default function EmailSignUpScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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

  const onSubmit = async () => {
    const n = name.trim();
    const em = email.trim().toLowerCase();
    if (!n) {
      Alert.alert(t('emailSignUp.title'), t('emailSignUp.displayName'));
      return;
    }
    if (!EMAIL_RE.test(em)) {
      Alert.alert(t('login.alertInvalidEmailTitle'), t('login.alertInvalidEmailBody'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      Alert.alert(
        t('login.alertPasswordShortTitle'),
        t('login.alertPasswordShortBody', { min: MIN_PASSWORD }),
      );
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('register.alertMismatchTitle'), t('register.alertMismatchBody'));
      return;
    }
    setLoading(true);
    try {
      const res = await registerMemberMinimal({ name: n, email: em, password });
      if (!res.ok) {
        Alert.alert(t('register.alertRegistrationFailedTitle'), res.message);
        return;
      }
      navigation.navigate('VerifyEmail', { email: em });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <Text style={styles.title}>{t('emailSignUp.title')}</Text>
      <Text style={styles.subtitle}>{t('emailSignUp.subtitle')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('emailSignUp.displayName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('emailSignUp.namePh')}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('emailSignUp.email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder={t('emailSignUp.emailPh')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('emailSignUp.password')}</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder={t('emailSignUp.passwordPh')}
          colors={colors}
          editable={!loading}
          suppressIosStrongPassword
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('emailSignUp.confirm')}</Text>
        <PasswordField
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t('register.confirmPlaceholder')}
          colors={colors}
          editable={!loading}
          suppressIosStrongPassword
        />
      </View>

      <AppPressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>{t('emailSignUp.create')}</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <AppPressable onPress={() => navigation.navigate('Login')} disabled={loading} hitSlop={12}>
          <Text style={styles.footerLink}>{t('emailSignUp.haveAccount')}</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
}
