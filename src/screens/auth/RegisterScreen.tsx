import React, { useMemo, useState } from 'react';
import { useLocale } from '../../locale';
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
import { registerMember } from '../../api/registerMember';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { DateOfBirthField } from '../../components/DateOfBirthField';
import { PasswordField } from '../../components/PasswordField';
import type { RootStackParamList } from '../../navigation/types';
import { toIsoDateString } from '../../utils/dateFormat';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_DOB = new Date(1900, 0, 1);

const RegisterScreen = ({ navigation }: Props) => {
  const { colors, colorScheme } = useAppTheme();
  const { t } = useLocale();

  const dobLocaleStrings = useMemo(
    () => ({
      tapToChoose: t('dateOfBirth.tapToChoose'),
      clear: t('dateOfBirth.clear'),
      iosCancel: t('dateOfBirth.iosCancel'),
      iosDone: t('dateOfBirth.iosDone'),
      iosTitle: t('dateOfBirth.iosTitle'),
      chooseA11y: t('dateOfBirth.chooseA11y'),
      clearA11y: t('dateOfBirth.clearA11y'),
      closePickerA11y: t('dateOfBirth.closePickerA11y'),
    }),
    [t],
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  /** `null` = user has not chosen a date (optional field). */
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [education, setEducation] = useState('');
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
          marginBottom: 22,
        },
        field: {
          marginBottom: 16,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        hint: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 6,
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
          marginTop: 24,
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

  const onSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const dobStr = dobDate ? toIsoDateString(dobDate) : '';

    if (!trimmedName) {
      Alert.alert(
        t('register.alertMissingNameTitle'),
        t('register.alertMissingNameBody'),
      );
      return;
    }
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      Alert.alert(
        t('register.alertInvalidEmailTitle'),
        t('register.alertInvalidEmailBody'),
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        t('register.alertWeakPasswordTitle'),
        t('register.alertWeakPasswordBody'),
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        t('register.alertMismatchTitle'),
        t('register.alertMismatchBody'),
      );
      return;
    }

    setLoading(true);
    try {
      const result = await registerMember({
        name: trimmedName,
        email: trimmedEmail,
        password,
        dob: dobStr || null,
        education: education.trim() || null,
      });

      if (!result.ok) {
        Alert.alert(t('register.alertRegistrationFailedTitle'), result.message);
        return;
      }

      navigation.navigate('VerifyEmail', { email: trimmedEmail });
    } finally {
      setLoading(false);
    }
  };

  const maxDob = useMemo(() => new Date(), []);

  return (
    <AuthScreenShell logoWidth={220}>
      <Text style={styles.title}>{t('register.title')}</Text>
      <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('register.fullName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder={t('register.namePlaceholder')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('register.email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder={t('register.emailPlaceholder')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('register.password')}</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder={t('register.passwordPlaceholder')}
          colors={colors}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('register.confirmPassword')}</Text>
        <PasswordField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('register.confirmPlaceholder')}
          colors={colors}
          editable={!loading}
        />
      </View>

      <DateOfBirthField
        value={dobDate}
        onChange={setDobDate}
        colors={colors}
        colorScheme={colorScheme}
        label={t('register.dobLabel')}
        hint={t('register.dobHint')}
        localeStrings={dobLocaleStrings}
        disabled={loading}
        minDate={MIN_DOB}
        maxDate={maxDob}
      />

      <View style={styles.field}>
        <Text style={styles.label}>{t('register.educationOptional')}</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={setEducation}
          placeholder={t('register.educationPlaceholder')}
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
          <Text style={styles.buttonText}>{t('register.submit')}</Text>
        )}
      </AppPressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('register.footerHaveAccount')}</Text>
        <AppPressable
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          hitSlop={12}>
          <Text style={styles.footerLink}>{t('register.footerSignIn')}</Text>
        </AppPressable>
      </View>
    </AuthScreenShell>
  );
};

export default RegisterScreen;
