import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../locale';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { DateOfBirthField } from '../../components/DateOfBirthField';
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
  const [skillsText, setSkillsText] = useState('');
  const [hobbiesText, setHobbiesText] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const maxDob = useMemo(() => new Date(), []);

  const hydrateFormFromUser = useCallback((u: RegisteredAppUser) => {
    setName(u.name);
    setEducation(u.education?.trim() ? u.education : '');
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
      if (next) {
        await updateSessionUser(next);
      }
    } finally {
      setRefreshing(false);
    }
  }, [token, updateSessionUser]);

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
    setSaving(true);
    try {
      const result = await updateMyProfile(token, {
        name: trimmed,
        dob: dobDate ? toIsoDateString(dobDate) : null,
        education: education.trim() || null,
        skills: fromCommaList(skillsText),
        hobbies: fromCommaList(hobbiesText),
      });
      if (!result.ok) {
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
    (isEditing ? 160 : 0);

  return (
    <KeyboardAvoidingView
      style={formStyles.keyboardAvoidRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}>
      <ScrollView
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
          <View style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.fullName')}</Text>
            <TextInput
              style={formStyles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
            />
          </View>

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
          />

          <View style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.educationOptional')}</Text>
            <TextInput
              style={formStyles.input}
              value={education}
              onChangeText={setEducation}
              placeholder={t('profile.educationPlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
            />
          </View>

          <View style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.skills')}</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={skillsText}
              onChangeText={setSkillsText}
              placeholder={t('profile.skillsPlaceholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
            />
            <Text style={formStyles.hint}>{t('profile.skillsFieldHint')}</Text>
          </View>

          <View style={formStyles.field}>
            <Text style={formStyles.label}>{t('profile.hobbies')}</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={hobbiesText}
              onChangeText={setHobbiesText}
              placeholder={t('profile.hobbiesPlaceholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
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
