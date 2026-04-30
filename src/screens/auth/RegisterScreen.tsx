import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useLocale } from '../../locale';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  type KeyboardEvent,
  Platform,
  type LayoutChangeEvent,
  type ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerMember } from '../../api/registerMember';
import { AppPressable } from '../../components/AppPressable';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { DateOfBirthField } from '../../components/DateOfBirthField';
import { PasswordField } from '../../components/PasswordField';
import { SelectField } from '../../components/SelectField';
import {
  ETHNICITY_OPTION_VALUES,
  GENDER_OPTION_VALUES,
  MARITAL_OPTION_VALUES,
} from '../../constants/demographicSelectOptions';
import countryNames from '../../data/countryNames.json';
import type { RootStackParamList } from '../../navigation/types';
import { toIsoDateString } from '../../utils/dateFormat';
import { scrollFieldToCenter } from '../../utils/scrollFieldToCenter';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_DOB = new Date(1900, 0, 1);

const RegisterScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
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
  const [gender, setGender] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [country, setCountry] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const viewportH = useRef(0);
  const kbHeightRef = useRef(0);
  const activeFieldRef = useRef<RefObject<View | null> | null>(null);
  const nameFieldRef = useRef<View>(null);
  const emailFieldRef = useRef<View>(null);
  const passwordFieldRef = useRef<View>(null);
  const confirmFieldRef = useRef<View>(null);
  const dobFieldRef = useRef<View>(null);
  const educationFieldRef = useRef<View>(null);
  const demographicsSectionRef = useRef<View>(null);

  const recenterActive = useCallback(() => {
    const fieldRef = activeFieldRef.current;
    if (!fieldRef?.current) {
      return;
    }
    const sv = scrollRef.current;
    if (!sv) {
      return;
    }
    (sv as unknown as View).measure((_x, _y, _w, h) => {
      if (h > 0) {
        viewportH.current = h;
      }
      const vh = viewportH.current;
      const hasKb = kbHeightRef.current > 0;
      const obscured = hasKb
        ? Math.min(kbHeightRef.current, vh * 0.7)
        : 0;
      scrollFieldToCenter(scrollRef, fieldRef, vh, {
        obscuredBottom: obscured,
        centerFraction: hasKb ? 0.38 : 0.5,
      });
    });
  }, []);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) => {
      kbHeightRef.current = e.endCoordinates.height;
      setTimeout(() => {
        recenterActive();
      }, 64);
    };
    const onHide = () => {
      kbHeightRef.current = 0;
    };
    const show = Keyboard.addListener(showEvt, onShow);
    const hide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      show.remove();
      hide.remove();
    };
  }, [recenterActive]);

  const onScrollViewLayout = useCallback(
    (e: LayoutChangeEvent) => {
      viewportH.current = e.nativeEvent.layout.height;
      if (kbHeightRef.current > 0) {
        setTimeout(() => {
          recenterActive();
        }, 32);
      }
    },
    [recenterActive],
  );

  const scheduleCenterField = useCallback((fieldRef: RefObject<View | null>) => {
    activeFieldRef.current = fieldRef;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const sv = scrollRef.current;
        if (!sv) {
          return;
        }
        (sv as unknown as View).measure((_x, _y, _w, h) => {
          if (h > 0) {
            viewportH.current = h;
          }
          const vh = viewportH.current;
          const hasKb = kbHeightRef.current > 0;
          const obscured = hasKb
            ? Math.min(kbHeightRef.current, vh * 0.7)
            : 0;
          scrollFieldToCenter(scrollRef, fieldRef, vh, {
            obscuredBottom: obscured,
            centerFraction: hasKb ? 0.38 : 0.5,
          });
        });
      });
    });
  }, []);

  const registerScrollPadding = useMemo(
    () => ({ paddingBottom: Math.max(insets.bottom, 24) + 48 + 400 }),
    [insets.bottom],
  );

  const countryOptions = useMemo(
    () =>
      (countryNames as string[]).map(name => ({ value: name, label: name })),
    [],
  );
  const genderOptions = useMemo(
    () =>
      GENDER_OPTION_VALUES.map(v => ({
        value: v,
        label: t(`demographics.gender.${v}`),
      })),
    [t],
  );
  const ethnicityOptions = useMemo(
    () =>
      ETHNICITY_OPTION_VALUES.map(v => ({
        value: v,
        label: t(`demographics.ethnicity.${v}`),
      })),
    [t],
  );
  const maritalOptions = useMemo(
    () =>
      MARITAL_OPTION_VALUES.map(v => ({
        value: v,
        label: t(`demographics.marital.${v}`),
      })),
    [t],
  );

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

    const g = gender.trim();
    const eth = ethnicity.trim();
    const c = country.trim();
    const st = stateRegion.trim();
    const ci = city.trim();
    const z = zipCode.trim();
    const m = maritalStatus.trim();
    if (!g || !eth || !c || !st || !ci || !z || !m) {
      Alert.alert(
        t('register.alertDemographicsTitle'),
        t('register.alertDemographicsBody'),
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
        gender: g,
        ethnicity: eth,
        country: c,
        state: st,
        city: ci,
        zip_code: z,
        marital_status: m,
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
    <AuthScreenShell
      scrollViewRef={scrollRef}
      onScrollViewLayout={onScrollViewLayout}
      contentContainerStyle={registerScrollPadding}>
      <Text style={styles.title}>{t('register.title')}</Text>
      <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

      <View ref={nameFieldRef} collapsable={false} style={styles.field}>
        <Text style={styles.label}>{t('register.fullName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder={t('register.namePlaceholder')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
          onFocus={() => scheduleCenterField(nameFieldRef)}
        />
      </View>

      <View ref={emailFieldRef} collapsable={false} style={styles.field}>
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
          onFocus={() => scheduleCenterField(emailFieldRef)}
        />
      </View>

      <View ref={passwordFieldRef} collapsable={false} style={styles.field}>
        <Text style={styles.label}>{t('register.password')}</Text>
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder={t('register.passwordPlaceholder')}
          colors={colors}
          editable={!loading}
          onInputFocus={() => scheduleCenterField(passwordFieldRef)}
          suppressIosStrongPassword
        />
      </View>

      <View ref={confirmFieldRef} collapsable={false} style={styles.field}>
        <Text style={styles.label}>{t('register.confirmPassword')}</Text>
        <PasswordField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('register.confirmPlaceholder')}
          colors={colors}
          editable={!loading}
          onInputFocus={() => scheduleCenterField(confirmFieldRef)}
          suppressIosStrongPassword
        />
      </View>

      <View ref={dobFieldRef} collapsable={false}>
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
          onFieldPress={() => scheduleCenterField(dobFieldRef)}
        />
      </View>

      <View ref={educationFieldRef} collapsable={false} style={styles.field}>
        <Text style={styles.label}>{t('register.educationOptional')}</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={setEducation}
          placeholder={t('register.educationPlaceholder')}
          placeholderTextColor={colors.placeholder}
          editable={!loading}
          onFocus={() => scheduleCenterField(educationFieldRef)}
        />
      </View>

      <View ref={demographicsSectionRef} collapsable={false}>
        <View style={styles.field}>
          <SelectField
            label={t('register.gender')}
            value={gender}
            placeholder={t('demographics.tapToSelect')}
            options={genderOptions}
            onChange={setGender}
            colors={colors}
            disabled={loading}
            modalTitle={t('demographics.pickGender')}
            closeA11yLabel={t('demographics.done')}
            noResultsLabel={t('demographics.noMatches')}
            onOpen={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <SelectField
            label={t('register.ethnicity')}
            value={ethnicity}
            placeholder={t('demographics.tapToSelect')}
            options={ethnicityOptions}
            onChange={setEthnicity}
            colors={colors}
            disabled={loading}
            modalTitle={t('demographics.pickEthnicity')}
            closeA11yLabel={t('demographics.done')}
            noResultsLabel={t('demographics.noMatches')}
            onOpen={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <SelectField
            label={t('register.country')}
            value={country}
            placeholder={t('demographics.tapToSelect')}
            options={countryOptions}
            onChange={setCountry}
            colors={colors}
            disabled={loading}
            searchable
            searchPlaceholder={t('demographics.searchCountries')}
            modalTitle={t('demographics.pickCountry')}
            closeA11yLabel={t('demographics.done')}
            noResultsLabel={t('demographics.noMatches')}
            onOpen={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('register.state')}</Text>
          <TextInput
            style={styles.input}
            value={stateRegion}
            onChangeText={setStateRegion}
            autoCapitalize="words"
            placeholder={t('register.statePlaceholder')}
            placeholderTextColor={colors.placeholder}
            editable={!loading}
            onFocus={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('register.city')}</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            placeholder={t('register.cityPlaceholder')}
            placeholderTextColor={colors.placeholder}
            editable={!loading}
            onFocus={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('register.zipCode')}</Text>
          <TextInput
            style={styles.input}
            value={zipCode}
            onChangeText={setZipCode}
            autoCapitalize="characters"
            placeholder={t('register.zipCodePlaceholder')}
            placeholderTextColor={colors.placeholder}
            editable={!loading}
            onFocus={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
        <View style={styles.field}>
          <SelectField
            label={t('register.maritalStatus')}
            value={maritalStatus}
            placeholder={t('demographics.tapToSelect')}
            options={maritalOptions}
            onChange={setMaritalStatus}
            colors={colors}
            disabled={loading}
            modalTitle={t('demographics.pickMarital')}
            closeA11yLabel={t('demographics.done')}
            noResultsLabel={t('demographics.noMatches')}
            onOpen={() => scheduleCenterField(demographicsSectionRef)}
          />
        </View>
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
