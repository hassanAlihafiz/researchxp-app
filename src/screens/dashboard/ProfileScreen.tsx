import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useLocale } from '../../locale';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  type KeyboardEvent,
  KeyboardAvoidingView,
  Platform,
  type LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  type BottomTabScreenProps,
  useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteMyAccount, fetchMyProfile, updateMyProfile } from '../../api/memberProfile';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { SelectField } from '../../components/SelectField';
import { DateOfBirthField } from '../../components/DateOfBirthField';
import {
  ETHNICITY_OPTION_VALUES,
  GENDER_OPTION_VALUES,
  MARITAL_OPTION_VALUES,
} from '../../constants/demographicSelectOptions';
import countryNames from '../../data/countryNames.json';
import { resetToLogin } from '../../navigation/navigationRef';
import type { MainTabParamList } from '../../navigation/types';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';
import {
  formatIsoDateStringForDisplay,
  parseIsoDateToLocal,
  toIsoDateString,
} from '../../utils/dateFormat';
import { scrollFieldToCenter } from '../../utils/scrollFieldToCenter';
import {
  displayEthnicity,
  displayGender,
  displayMarital,
} from '../../utils/demographicsDisplay';
import type { RegisteredAppUser } from '../../api/registerMember';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

const MIN_DOB = new Date(1900, 0, 1);

function toCommaList(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function fromCommaList(text: string): string[] {
  return text
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function displayDetailList(value: unknown): string {
  const t = toCommaList(value);
  return t || '—';
}

function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) {
    return '—';
  }
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  try {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ProfileScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { email, user, token, updateSessionUser, signOut } = useAuth();
  const { colors, colorScheme } = useAppTheme();
  const { t } = useLocale();
  const baseStyles = useMemo(() => createDashboardStyles(colors), [colors]);

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
  const formStyles = useMemo(
    () =>
      StyleSheet.create({
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
        inputMultiline: {
          minHeight: 88,
          textAlignVertical: 'top' as const,
        },
        emailReadonly: { opacity: 0.9 },
        saveRow: { marginTop: 8, marginBottom: 12 },
        buttonRow: {
          flexDirection: 'row' as const,
          gap: 12,
          marginBottom: 24,
        },
        saveButton: {
          flex: 1,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
        },
        saveButtonDisabled: { opacity: 0.7 },
        saveText: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '600',
        },
        cancelButton: {
          flex: 1,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        cancelText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        editDetailsButton: {
          marginTop: 8,
          marginBottom: 20,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: 'transparent',
        },
        editDetailsText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.primary,
        },
        field: { marginBottom: 4 },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 8,
        },
        hint: { fontSize: 12, color: colors.textMuted, marginTop: 6, marginBottom: 14 },
        deleteSection: { marginTop: 8, marginBottom: 12 },
        deleteAccountButton: {
          marginTop: 4,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#c62828',
          backgroundColor: 'transparent',
        },
        deleteAccountText: {
          fontSize: 16,
          fontWeight: '600',
          color: '#e53935',
        },
        deleteHint: {
          fontSize: 13,
          color: colors.textMuted,
          lineHeight: 20,
          marginTop: 10,
        },
        keyboardAvoidRoot: {
          flex: 1,
          backgroundColor: colors.background,
        },
      }),
    [colors],
  );

  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [gender, setGender] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [country, setCountry] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [hobbiesText, setHobbiesText] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const maxDob = useMemo(() => new Date(), []);

  const scrollRef = useRef<ScrollView>(null);
  const viewportH = useRef(0);
  const kbHeightRef = useRef(0);
  const activeFieldRef = useRef<RefObject<View | null> | null>(null);
  const nameFieldRef = useRef<View>(null);
  const dobFieldRef = useRef<View>(null);
  const educationFieldRef = useRef<View>(null);
  const demographicsFieldRef = useRef<View>(null);
  const skillsFieldRef = useRef<View>(null);
  const hobbiesFieldRef = useRef<View>(null);

  const recenterActive = useCallback(() => {
    if (!isEditing) {
      return;
    }
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
  }, [isEditing]);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) => {
      kbHeightRef.current = e.endCoordinates.height;
      if (!isEditing) {
        return;
      }
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
  }, [isEditing, recenterActive]);

  const onScrollViewLayout = useCallback(
    (e: LayoutChangeEvent) => {
      viewportH.current = e.nativeEvent.layout.height;
      if (kbHeightRef.current > 0 && isEditing) {
        setTimeout(() => {
          recenterActive();
        }, 32);
      }
    },
    [isEditing, recenterActive],
  );

  const scheduleCenterField = useCallback(
    (fieldRef: RefObject<View | null>) => {
      if (!isEditing) {
        return;
      }
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
    },
    [isEditing],
  );

  const hydrateFormFromUser = useCallback((u: RegisteredAppUser) => {
    setName(u.name);
    setEducation(u.education?.trim() ? u.education : '');
    setGender(u.gender?.trim() ? u.gender : '');
    setEthnicity(u.ethnicity?.trim() ? u.ethnicity : '');
    setCountry(u.country?.trim() ? u.country : '');
    setStateRegion(u.state?.trim() ? u.state : '');
    setCity(u.city?.trim() ? u.city : '');
    setZipCode(u.zip_code?.trim() ? u.zip_code : '');
    setMaritalStatus(u.marital_status?.trim() ? u.marital_status : '');
    setSkillsText(toCommaList(u.skills));
    setHobbiesText(toCommaList(u.hobbies));
    setDobDate(parseIsoDateToLocal(u.date_of_birth));
  }, []);

  useEffect(() => {
    if (!user || isEditing) {
      return;
    }
    hydrateFormFromUser(user);
  }, [user, isEditing, hydrateFormFromUser]);

  const onPressEdit = useCallback(() => {
    if (user) {
      hydrateFormFromUser(user);
    }
    setIsEditing(true);
  }, [user, hydrateFormFromUser]);

  const onPressCancel = useCallback(() => {
    setIsEditing(false);
    if (user) {
      hydrateFormFromUser(user);
    }
  }, [user, hydrateFormFromUser]);

  const onRefresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setRefreshing(true);
    try {
      const next = await fetchMyProfile(token);
      if (next === 'account_disabled') {
        await signOut();
        resetToLogin();
        return;
      }
      if (next) {
        await updateSessionUser(next);
      }
    } finally {
      setRefreshing(false);
    }
  }, [token, updateSessionUser, signOut]);

  const onSave = async () => {
    if (!token) {
      Alert.alert(
        t('profile.alertNotSignedInProfileTitle'),
        t('profile.alertNotSignedInProfileBody'),
      );
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(
        t('profile.alertNameRequiredTitle'),
        t('profile.alertNameRequiredBody'),
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
    setSaving(true);
    try {
      const result = await updateMyProfile(token, {
        name: trimmed,
        dob: dobDate ? toIsoDateString(dobDate) : null,
        education: education.trim() || null,
        skills: fromCommaList(skillsText),
        hobbies: fromCommaList(hobbiesText),
        gender: g,
        ethnicity: eth,
        country: c,
        state: st,
        city: ci,
        zip_code: z,
        marital_status: m,
      });
      if (!result.ok) {
        if (result.status === 403 && result.accountDisabled) {
          await signOut();
          resetToLogin();
          return;
        }
        Alert.alert(
          t('profile.alertCouldNotSaveTitle'),
          result.status === 401
            ? t('profile.alertSessionExpiredBody')
            : result.message,
        );
        return;
      }
      await updateSessionUser(result.user);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAccount = useCallback(() => {
    if (!token) {
      Alert.alert(
        t('profile.alertNotSignedInManageTitle'),
        t('profile.alertNotSignedInManageBody'),
      );
      return;
    }
    Alert.alert(t('profile.deleteConfirmTitle'), t('profile.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.deleteAccountButton'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('profile.deleteSureTitle'), t('profile.deleteSureBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                setDeletingAccount(true);
                try {
                  const result = await deleteMyAccount(token);
                  if (!result.ok) {
                    Alert.alert(
                      t('profile.alertCouldNotDeleteTitle'),
                      result.status === 401
                        ? t('profile.alertDeleteSessionExpiredBody')
                        : result.message,
                    );
                    return;
                  }
                  await signOut();
                  resetToLogin();
                } finally {
                  setDeletingAccount(false);
                }
              },
            },
          ]);
        },
      },
    ]);
  }, [t, token, signOut]);

  const displayEmail = user?.email ?? email ?? t('common.emDash');
  const verification =
    user == null
      ? t('common.emDash')
      : user.verified === true
        ? t('profile.verified')
        : t('profile.notVerified');

  const canEdit = Boolean(user && token);
  const showLegacyHint = user == null && email;

  const dataPrivacyContent = (
    <>
      <Text style={[baseStyles.overline, formStyles.deleteSection]}>
        {t('profile.dataPrivacyOverline')}
      </Text>
      <View style={baseStyles.elevatedBlock}>
        <Text style={baseStyles.paragraph}>{t('profile.dataPrivacyBody')}</Text>
        <AppPressable
          style={[
            formStyles.deleteAccountButton,
            deletingAccount && formStyles.saveButtonDisabled,
          ]}
          onPress={confirmDeleteAccount}
          disabled={deletingAccount}
          accessibilityRole="button"
          accessibilityLabel={t('profile.deleteAccountA11y')}>
          {deletingAccount ? (
            <ActivityIndicator color="#e53935" />
          ) : (
            <Text style={formStyles.deleteAccountText}>
              {t('profile.deleteAccount')}
            </Text>
          )}
        </AppPressable>
        <Text style={formStyles.deleteHint}>{t('profile.deleteHint')}</Text>
      </View>
    </>
  );

  const scrollBottomPad =
    insets.bottom +
    tabBarHeight +
    24 +
    (isEditing ? 200 : 0);

  return (
    <KeyboardAvoidingView
      style={formStyles.keyboardAvoidRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}>
      <ScrollView
        ref={scrollRef}
        onLayout={onScrollViewLayout}
        style={baseStyles.root}
        contentContainerStyle={{
          paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
          paddingBottom: scrollBottomPad,
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={Boolean(token)}
            tintColor={colors.primary}
          />
        }>
      <Text style={baseStyles.screenTitle}>{t('profile.screenTitle')}</Text>
      {/* <Text style={baseStyles.screenLead}>
        Your ResearchXP account. Use Edit details to change your profile. Email
        is shown for reference and cannot be changed in the app.
      </Text> */}

      <Text style={baseStyles.overline}>{t('profile.accountOverline')}</Text>
      <View style={baseStyles.elevatedBlock}>
        <Text style={baseStyles.fieldLabel}>{t('common.email')}</Text>
        <Text style={[baseStyles.fieldValue, formStyles.emailReadonly]}>
          {displayEmail}
        </Text>
        <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
          {t('profile.verificationStatus')}
        </Text>
        <Text style={baseStyles.fieldValue}>{verification}</Text>
        <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
          {t('profile.memberSince')}
        </Text>
        <Text style={baseStyles.fieldValue}>
          {user ? formatMemberSince(user.created_at) : t('common.emDash')}
        </Text>
      </View>

      {!user && token ? (
        <View style={baseStyles.elevatedBlock}>
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 10 }} />
          <Text style={baseStyles.paragraph}>
            {refreshing
              ? t('profile.loadingRefreshing')
              : t('profile.loadingProfile')}
          </Text>
        </View>
      ) : null}

      {token && !user ? dataPrivacyContent : null}

      {user && !isEditing ? (
        <>
          <Text style={baseStyles.overline}>{t('profile.yourDetails')}</Text>
          <View style={baseStyles.elevatedBlock}>
            <Text style={baseStyles.fieldLabel}>{t('profile.fullName')}</Text>
            <Text style={baseStyles.fieldValue}>{user.name}</Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.dateOfBirth')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {formatIsoDateStringForDisplay(user.date_of_birth)}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.education')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {user.education?.trim() ? user.education : t('common.emDash')}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.gender')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {displayGender(user.gender, t, t('common.emDash'))}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.ethnicity')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {displayEthnicity(user.ethnicity, t, t('common.emDash'))}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.country')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {user.country?.trim() ? user.country : t('common.emDash')}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.state')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {user.state?.trim() ? user.state : t('common.emDash')}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.city')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {user.city?.trim() ? user.city : t('common.emDash')}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.zipCode')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {user.zip_code?.trim() ? user.zip_code : t('common.emDash')}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.maritalStatus')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {displayMarital(user.marital_status, t, t('common.emDash'))}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.skills')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {displayDetailList(user.skills)}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              {t('profile.hobbies')}
            </Text>
            <Text style={baseStyles.fieldValue}>
              {displayDetailList(user.hobbies)}
            </Text>
          </View>
          {canEdit ? (
            <AppPressable
              style={formStyles.editDetailsButton}
              onPress={onPressEdit}
              accessibilityRole="button"
              accessibilityLabel={t('profile.editDetailsA11y')}>
              <Text style={formStyles.editDetailsText}>{t('profile.editDetails')}</Text>
            </AppPressable>
          ) : null}
          {token ? dataPrivacyContent : null}
        </>
      ) : null}

      {user && isEditing ? (
        <>
          <Text style={baseStyles.overline}>{t('profile.editOverline')}</Text>
          <Text style={[baseStyles.paragraph, { marginBottom: 16 }]}>
            {t('profile.editIntro')}
          </Text>
          <View
            ref={nameFieldRef}
            collapsable={false}
            style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.fullName')}</Text>
            <TextInput
              style={formStyles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
              onFocus={() => scheduleCenterField(nameFieldRef)}
            />
          </View>

          <View ref={dobFieldRef} collapsable={false}>
            <DateOfBirthField
              value={dobDate}
              onChange={setDobDate}
              colors={colors}
              colorScheme={colorScheme}
              label={t('profile.dobLabel')}
              hint={t('profile.dobHint')}
              localeStrings={dobLocaleStrings}
              disabled={!canEdit || saving}
              minDate={MIN_DOB}
              maxDate={maxDob}
              onFieldPress={() => scheduleCenterField(dobFieldRef)}
            />
          </View>

          <View
            ref={educationFieldRef}
            collapsable={false}
            style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.educationOptional')}</Text>
            <TextInput
              style={formStyles.input}
              value={education}
              onChangeText={setEducation}
              placeholder={t('profile.educationPlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
              onFocus={() => scheduleCenterField(educationFieldRef)}
            />
          </View>

          <View ref={demographicsFieldRef} collapsable={false}>
            <View style={formStyles.field}>
              <SelectField
                label={t('profile.gender')}
                value={gender}
                placeholder={t('demographics.tapToSelect')}
                options={genderOptions}
                onChange={setGender}
                colors={colors}
                disabled={!canEdit || saving}
                modalTitle={t('demographics.pickGender')}
                closeA11yLabel={t('demographics.done')}
                noResultsLabel={t('demographics.noMatches')}
                onOpen={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <SelectField
                label={t('profile.ethnicity')}
                value={ethnicity}
                placeholder={t('demographics.tapToSelect')}
                options={ethnicityOptions}
                onChange={setEthnicity}
                colors={colors}
                disabled={!canEdit || saving}
                modalTitle={t('demographics.pickEthnicity')}
                closeA11yLabel={t('demographics.done')}
                noResultsLabel={t('demographics.noMatches')}
                onOpen={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <SelectField
                label={t('profile.country')}
                value={country}
                placeholder={t('demographics.tapToSelect')}
                options={countryOptions}
                onChange={setCountry}
                colors={colors}
                disabled={!canEdit || saving}
                searchable
                searchPlaceholder={t('demographics.searchCountries')}
                modalTitle={t('demographics.pickCountry')}
                closeA11yLabel={t('demographics.done')}
                noResultsLabel={t('demographics.noMatches')}
                onOpen={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <Text style={formStyles.label}>{t('profile.state')}</Text>
              <TextInput
                style={formStyles.input}
                value={stateRegion}
                onChangeText={setStateRegion}
                autoCapitalize="words"
                placeholder={t('register.statePlaceholder')}
                placeholderTextColor={colors.placeholder}
                editable={canEdit && !saving}
                onFocus={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <Text style={formStyles.label}>{t('profile.city')}</Text>
              <TextInput
                style={formStyles.input}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                placeholder={t('register.cityPlaceholder')}
                placeholderTextColor={colors.placeholder}
                editable={canEdit && !saving}
                onFocus={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <Text style={formStyles.label}>{t('profile.zipCode')}</Text>
              <TextInput
                style={formStyles.input}
                value={zipCode}
                onChangeText={setZipCode}
                autoCapitalize="characters"
                placeholder={t('register.zipCodePlaceholder')}
                placeholderTextColor={colors.placeholder}
                editable={canEdit && !saving}
                onFocus={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
            <View style={formStyles.field}>
              <SelectField
                label={t('profile.maritalStatus')}
                value={maritalStatus}
                placeholder={t('demographics.tapToSelect')}
                options={maritalOptions}
                onChange={setMaritalStatus}
                colors={colors}
                disabled={!canEdit || saving}
                modalTitle={t('demographics.pickMarital')}
                closeA11yLabel={t('demographics.done')}
                noResultsLabel={t('demographics.noMatches')}
                onOpen={() => scheduleCenterField(demographicsFieldRef)}
              />
            </View>
          </View>

          <View
            ref={skillsFieldRef}
            collapsable={false}
            style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.skills')}</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={skillsText}
              onChangeText={setSkillsText}
              placeholder={t('profile.skillsPlaceholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
              onFocus={() => scheduleCenterField(skillsFieldRef)}
            />
            <Text style={formStyles.hint}>{t('profile.skillsFieldHint')}</Text>
          </View>

          <View
            ref={hobbiesFieldRef}
            collapsable={false}
            style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.hobbies')}</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={hobbiesText}
              onChangeText={setHobbiesText}
              placeholder={t('profile.hobbiesPlaceholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
              onFocus={() => scheduleCenterField(hobbiesFieldRef)}
            />
          </View>

          <View style={formStyles.buttonRow}>
            <AppPressable
              style={formStyles.cancelButton}
              onPress={onPressCancel}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={t('profile.cancelEditA11y')}>
              <Text style={formStyles.cancelText}>{t('profile.cancel')}</Text>
            </AppPressable>
            <AppPressable
              style={[
                formStyles.saveButton,
                (!canEdit || saving) && formStyles.saveButtonDisabled,
              ]}
              onPress={onSave}
              disabled={!canEdit || saving}
              accessibilityRole="button"
              accessibilityLabel={t('profile.saveA11y')}>
              {saving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={formStyles.saveText}>{t('profile.save')}</Text>
              )}
            </AppPressable>
          </View>
        </>
      ) : null}

      {showLegacyHint ? (
        <Text style={baseStyles.hint}>
          {token ? t('profile.legacyHintToken') : t('profile.legacyHintNoToken')}
        </Text>
      ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
