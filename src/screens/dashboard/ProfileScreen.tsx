import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { deleteMyAccount, fetchMyProfile, updateMyProfile } from '../../api/memberProfile';
import { useAuth } from '../../auth/AuthContext';
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
  const { email, user, token, updateSessionUser, signOut } = useAuth();
  const { colors, colorScheme } = useAppTheme();
  const baseStyles = useMemo(() => createDashboardStyles(colors), [colors]);
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
      Alert.alert('Not signed in', 'Sign in again to update your profile.');
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter your name.');
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
          'Could not save',
          result.status === 401
            ? 'Your session has expired. Please sign in again.'
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
      Alert.alert('Not signed in', 'Sign in again to manage your account.');
      return;
    }
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your ResearchXP member account and profile data, including rewards balance and study assignment history tied to this account. This cannot be undone.\n\nIf you are in the EEA, UK, or California, this supports your right to erasure under GDPR and similar laws.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Your account will be removed immediately.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    setDeletingAccount(true);
                    try {
                      const result = await deleteMyAccount(token);
                      if (!result.ok) {
                        Alert.alert(
                          'Could not delete account',
                          result.status === 401
                            ? 'Your session has expired. Sign in again, then try deleting your account.'
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
              ],
            );
          },
        },
      ],
    );
  }, [token, signOut, resetToLogin]);

  const displayEmail = user?.email ?? email ?? '—';
  const verification =
    user == null
      ? '—'
      : user.verified === true
        ? 'Verified'
        : 'Not verified';

  const canEdit = Boolean(user && token);
  const showLegacyHint = user == null && email;

  const dataPrivacyContent = (
    <>
      <Text style={[baseStyles.overline, formStyles.deleteSection]}>
        Data & privacy
      </Text>
      <View style={baseStyles.elevatedBlock}>
        <Text style={baseStyles.paragraph}>
          You can delete your account at any time. We will remove your member
          profile and account data from our systems as described when you confirm.
        </Text>
        <Pressable
          style={[
            formStyles.deleteAccountButton,
            deletingAccount && formStyles.saveButtonDisabled,
          ]}
          onPress={confirmDeleteAccount}
          disabled={deletingAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete account">
          {deletingAccount ? (
            <ActivityIndicator color="#e53935" />
          ) : (
            <Text style={formStyles.deleteAccountText}>Delete account</Text>
          )}
        </Pressable>
        <Text style={formStyles.deleteHint}>
          ResearchXP may retain anonymized or aggregated research records where
          the law allows and personal identifiers have been removed.
        </Text>
      </View>
    </>
  );

  return (
    <ScrollView
      style={baseStyles.root}
      contentContainerStyle={{
        paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          enabled={Boolean(token)}
          tintColor={colors.primary}
        />
      }>
      <Text style={baseStyles.screenTitle}>Profile</Text>
      <Text style={baseStyles.screenLead}>
        Your ResearchXP account. Use Edit details to change your profile. Email
        is shown for reference and cannot be changed in the app.
      </Text>

      <Text style={baseStyles.overline}>Account</Text>
      <View style={baseStyles.elevatedBlock}>
        <Text style={baseStyles.fieldLabel}>Email</Text>
        <Text style={[baseStyles.fieldValue, formStyles.emailReadonly]}>
          {displayEmail}
        </Text>
        <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>Verification Status</Text>
        <Text style={baseStyles.fieldValue}>{verification}</Text>
        <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>Member since</Text>
        <Text style={baseStyles.fieldValue}>
          {user ? formatMemberSince(user.created_at) : '—'}
        </Text>
      </View>

      {!user && token ? (
        <View style={baseStyles.elevatedBlock}>
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 10 }} />
          <Text style={baseStyles.paragraph}>
            {refreshing
              ? 'Refreshing profile…'
              : 'Loading your profile… pull down to retry if this takes a while.'}
          </Text>
        </View>
      ) : null}

      {token && !user ? dataPrivacyContent : null}

      {user && !isEditing ? (
        <>
          <Text style={baseStyles.overline}>Your details</Text>
          <View style={baseStyles.elevatedBlock}>
            <Text style={baseStyles.fieldLabel}>Full name</Text>
            <Text style={baseStyles.fieldValue}>{user.name}</Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>
              Date of birth
            </Text>
            <Text style={baseStyles.fieldValue}>
              {formatIsoDateStringForDisplay(user.date_of_birth)}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>Education</Text>
            <Text style={baseStyles.fieldValue}>
              {user.education?.trim() ? user.education : '—'}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>Skills</Text>
            <Text style={baseStyles.fieldValue}>
              {displayDetailList(user.skills)}
            </Text>
            <Text style={[baseStyles.fieldLabel, { marginTop: 16 }]}>Hobbies</Text>
            <Text style={baseStyles.fieldValue}>
              {displayDetailList(user.hobbies)}
            </Text>
          </View>
          {canEdit ? (
            <Pressable
              style={formStyles.editDetailsButton}
              onPress={onPressEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit profile details">
              <Text style={formStyles.editDetailsText}>Edit details</Text>
            </Pressable>
          ) : null}
          {token ? dataPrivacyContent : null}
        </>
      ) : null}

      {user && isEditing ? (
        <>
          <Text style={baseStyles.overline}>Edit your details</Text>
          <Text style={[baseStyles.paragraph, { marginBottom: 16 }]}>
            Update your information below, then save. Changes apply to your
            ResearchXP account.
          </Text>
          <View style={formStyles.field}>
            <Text style={formStyles.label}>Full name</Text>
            <TextInput
              style={formStyles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Your name"
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
            />
          </View>

          <DateOfBirthField
            value={dobDate}
            onChange={setDobDate}
            colors={colors}
            colorScheme={colorScheme}
            label="Date of birth (optional)"
            hint="We use this to tailor studies. You can clear the date to leave it empty."
            disabled={!canEdit || saving}
            minDate={MIN_DOB}
            maxDate={maxDob}
          />

          <View style={formStyles.field}>
            <Text style={formStyles.label}>Education (optional)</Text>
            <TextInput
              style={formStyles.input}
              value={education}
              onChangeText={setEducation}
              placeholder="e.g. Bachelor's in Biology"
              placeholderTextColor={colors.placeholder}
              editable={canEdit && !saving}
            />
          </View>

          <View style={formStyles.field}>
            <Text style={formStyles.label}>Skills</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={skillsText}
              onChangeText={setSkillsText}
              placeholder="Separate with commas, e.g. data analysis, interviewing"
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
            />
            <Text style={formStyles.hint}>
              Separate items with commas.
            </Text>
          </View>

          <View style={formStyles.field}>
            <Text style={formStyles.label}>Hobbies</Text>
            <TextInput
              style={[formStyles.input, formStyles.inputMultiline]}
              value={hobbiesText}
              onChangeText={setHobbiesText}
              placeholder="Separate with commas"
              placeholderTextColor={colors.placeholder}
              multiline
              editable={canEdit && !saving}
            />
          </View>

          <View style={formStyles.buttonRow}>
            <Pressable
              style={formStyles.cancelButton}
              onPress={onPressCancel}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing">
              <Text style={formStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                formStyles.saveButton,
                (!canEdit || saving) && formStyles.saveButtonDisabled,
              ]}
              onPress={onSave}
              disabled={!canEdit || saving}
              accessibilityRole="button"
              accessibilityLabel="Save profile">
              {saving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={formStyles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      {showLegacyHint ? (
        <Text style={baseStyles.hint}>
          {token
            ? 'If the form does not load, pull down to refresh, or sign out and sign in again.'
            : 'Your saved session has no profile. Sign in again to load and edit your profile.'}
        </Text>
      ) : null}
    </ScrollView>
  );
}
