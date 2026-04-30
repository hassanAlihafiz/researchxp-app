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
import { useLocale } from '../../locale';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordNew'>;

export default function ForgotPasswordNewScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { t } = useLocale();
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
      Alert.alert(
        t('forgotNew.alertTooShortTitle'),
        t('forgotNew.alertTooShortBody'),
      );
      return;
    }
    if (password !== confirm) {
      Alert.alert(
        t('forgotNew.alertMismatchTitle'),
        t('forgotNew.alertMismatchBody'),
      );
      return;
    }
    setLoading(true);
    try {
      const result = await resetPasswordWithCode(email, code, password);
      if (!result.ok) {
        Alert.alert(t('forgotNew.alertCouldNotResetTitle'), result.message);
        return;
      }
      Alert.alert(t('forgotNew.alertPasswordUpdatedTitle'), result.message, [
        {
          text: t('common.ok'),
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <Text style={styles.title}>{t('forgotNew.title')}</Text>
      <Text style={styles.subtitle}>
        {t('forgotNew.subtitleBefore')}
        <Text style={styles.emailHighlight}>{email}</Text>
        {t('forgotNew.subtitleAfter')}
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('forgotNew.newPassword')}</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder={t('forgotNew.newPasswordPlaceholder')}
          colors={colors}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('forgotNew.confirmPassword')}</Text>
        <PasswordField
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t('forgotNew.confirmPlaceholder')}
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
          <Text style={styles.buttonText}>{t('forgotNew.updateButton')}</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <AppPressable
          onPress={() => navigation.navigate('ForgotPasswordCode', { email })}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>{t('forgotNew.backToCode')}</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
}
