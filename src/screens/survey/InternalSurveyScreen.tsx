import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  fetchSurveyStart,
  requestSurveyCompleteSuccess,
  type SurveyScreen,
  type SurveyScreenField,
} from '../../api/surveyStart';
import { updateMyProfile } from '../../api/memberProfile';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { DateOfBirthField } from '../../components/DateOfBirthField';
import { SelectField } from '../../components/SelectField';
import {
  countryCodeSelectOptions,
  INCOME_BAND_OPTIONS,
} from '../../data/surveyStaticSelectOptions';
import { useLocale } from '../../locale';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';
import { parseIsoDateToLocal, toIsoDateString } from '../../utils/dateFormat';
import { normalizeSurveyAttributeKey } from '../../utils/surveyAttributeKey';
import { buildProfilePatchFromSurveyAnswers } from '../../utils/surveyProfileMerge';
import { appLog } from '../../utils/appLog';

type Props = NativeStackScreenProps<RootStackParamList, 'InternalSurvey'>;

function storageKey(field: SurveyScreenField): string {
  const k = normalizeSurveyAttributeKey(field.attribute_key);
  return k || `field_${field.id}`;
}

function selectOptionsForField(field: SurveyScreenField) {
  if (field.options.length > 0) {
    return field.options.map(o => ({ value: o.value, label: o.label }));
  }
  const key = normalizeSurveyAttributeKey(field.attribute_key);
  if (key === 'country_code' || key === 'country') {
    return countryCodeSelectOptions();
  }
  if (key === 'income_band') {
    return INCOME_BAND_OPTIONS;
  }
  return [];
}

export default function InternalSurveyScreen({ navigation, route }: Props) {
  const { assignmentId } = route.params;
  const insets = useSafeAreaInsets();
  const { colors, colorScheme } = useAppTheme();
  const { t } = useLocale();
  const { token, user, updateSessionUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screens, setScreens] = useState<SurveyScreen[]>([]);
  const [projectId, setProjectId] = useState(0);
  const [uniqueId, setUniqueId] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const loadErrorAlert = useCallback(() => {
    Alert.alert(t('survey.alertOpenFailedTitle'), t('survey.loadError'), [
      { text: t('common.ok'), onPress: () => navigation.goBack() },
    ]);
  }, [navigation, t]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      loadErrorAlert();
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchSurveyStart(token, assignmentId);
      if (cancelled) {
        return;
      }
      if (!res.ok) {
        appLog('api', 'survey start failed', { status: res.status, message: res.message });
        setLoading(false);
        loadErrorAlert();
        return;
      }
      if (!res.data.internal_questions || !res.data.screens?.length) {
        setLoading(false);
        navigation.goBack();
        return;
      }
      setScreens(res.data.screens);
      setProjectId(res.data.project_id);
      setUniqueId(res.data.unique_id);
      navigation.setOptions({ title: res.data.project_code || t('survey.loading') });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, assignmentId, navigation, loadErrorAlert, t]);

  const currentScreen = screens[step];
  const isLast = step >= screens.length - 1;

  const setSingle = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleMulti = useCallback((key: string, optionValue: string) => {
    setAnswers(prev => {
      const cur = prev[key];
      const list = Array.isArray(cur) ? [...cur] : [];
      const i = list.indexOf(optionValue);
      if (i >= 0) {
        list.splice(i, 1);
      } else {
        list.push(optionValue);
      }
      return { ...prev, [key]: list };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token || !user || !projectId || !uniqueId) {
      return;
    }
    setSubmitting(true);
    try {
      const patch = buildProfilePatchFromSurveyAnswers(user, answers);
      const updated = await updateMyProfile(token, patch);
      if (!updated.ok) {
        if (updated.accountDisabled) {
          Alert.alert(t('survey.submitError'), updated.message);
          setSubmitting(false);
          return;
        }
        Alert.alert(t('survey.submitError'), updated.message);
        setSubmitting(false);
        return;
      }
      await updateSessionUser(updated.user);

      const done = await requestSurveyCompleteSuccess(projectId, uniqueId);
      if (!done.ok) {
        Alert.alert(t('common.ok'), t('survey.completeError'));
        setSubmitting(false);
        navigation.goBack();
        return;
      }
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('survey.submitError');
      Alert.alert(t('survey.submitError'), msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    token,
    user,
    projectId,
    uniqueId,
    answers,
    navigation,
    t,
    updateSessionUser,
  ]);

  const onPrimaryPress = useCallback(() => {
    if (isLast) {
      void handleSubmit();
    } else {
      setStep(s => Math.min(s + 1, screens.length - 1));
    }
  }, [isLast, handleSubmit, screens.length]);

  const onBackPress = useCallback(() => {
    if (step <= 0) {
      navigation.goBack();
    } else {
      setStep(s => s - 1);
    }
  }, [navigation, step]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: 12,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
        },
        headline: {
          fontSize: 22,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 10,
          letterSpacing: -0.3,
        },
        sub: {
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 8,
        },
        why: {
          fontSize: 14,
          lineHeight: 20,
          color: colors.textMuted,
          marginBottom: 16,
          fontStyle: 'italic' as const,
        },
        fieldBlock: { marginBottom: 20 },
        multiHint: {
          fontSize: 13,
          color: colors.label,
          marginBottom: 8,
        },
        multiRow: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          paddingVertical: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        multiLabel: { flex: 1, fontSize: 16, color: colors.text, marginLeft: 10 },
        check: { fontSize: 18, color: colors.primary, width: 22 },
        textInput: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
        },
        actions: { marginTop: 8, gap: 12 },
        primary: {
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center' as const,
          opacity: 1,
        },
        primaryDisabled: { opacity: 0.65 },
        primaryText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
        secondary: {
          paddingVertical: 14,
          alignItems: 'center' as const,
        },
        secondaryText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
      }),
    [colors, insets.bottom],
  );

  const dobLocale = useMemo(
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

  if (loading || !currentScreen) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.sub, { marginTop: 12 }]}>{t('survey.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.root}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>{currentScreen.headline}</Text>
        {currentScreen.subhead ? (
          <Text style={styles.sub}>{currentScreen.subhead}</Text>
        ) : null}
        {currentScreen.why_this ? (
          <Text style={styles.why}>
            {t('survey.whyTitle')}: {currentScreen.why_this}
          </Text>
        ) : null}

        {currentScreen.fields.map(field => {
          const key = storageKey(field);
          const label =
            field.field_label?.trim() ||
            normalizeSurveyAttributeKey(field.attribute_key) ||
            '—';

          if (field.input_type === 'date') {
            const iso =
              typeof answers[key] === 'string' ? (answers[key] as string) : '';
            const dateVal = parseIsoDateToLocal(iso || undefined);
            return (
              <View key={field.id} style={styles.fieldBlock}>
                <DateOfBirthField
                  label={label}
                  value={dateVal}
                  onChange={d => {
                    setSingle(key, d ? toIsoDateString(d) : '');
                  }}
                  colors={colors}
                  colorScheme={colorScheme}
                  maxDate={new Date()}
                  localeStrings={dobLocale}
                />
              </View>
            );
          }

          if (field.input_type === 'text') {
            const v = typeof answers[key] === 'string' ? (answers[key] as string) : '';
            return (
              <View key={field.id} style={styles.fieldBlock}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.label,
                    marginBottom: 8,
                  }}>
                  {label}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={v}
                  onChangeText={txt => setSingle(key, txt)}
                  placeholder={field.placeholder ?? ''}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            );
          }

          if (field.input_type === 'single_select') {
            const opts = selectOptionsForField(field);
            const val = typeof answers[key] === 'string' ? (answers[key] as string) : '';
            if (opts.length === 0) {
              return (
                <View key={field.id} style={styles.fieldBlock}>
                  <Text style={styles.sub}>
                    {label} — {t('survey.loadError')}
                  </Text>
                </View>
              );
            }
            return (
              <View key={field.id} style={styles.fieldBlock}>
                <SelectField
                  label={label}
                  value={val}
                  placeholder={field.placeholder || t('survey.selectSearchPlaceholder')}
                  options={opts}
                  onChange={next => setSingle(key, next)}
                  colors={colors}
                  searchable={opts.length > 12}
                  searchPlaceholder={t('survey.selectSearchPlaceholder')}
                  modalTitle={label}
                  closeA11yLabel={t('survey.selectCloseA11y')}
                  noResultsLabel={t('survey.selectNoResults')}
                />
              </View>
            );
          }

          if (field.input_type === 'multi_select') {
            const opts = selectOptionsForField(field);
            const selected = Array.isArray(answers[key])
              ? (answers[key] as string[])
              : [];
            if (opts.length === 0) {
              return (
                <View key={field.id} style={styles.fieldBlock}>
                  <Text style={styles.sub}>{label}</Text>
                </View>
              );
            }
            return (
              <View key={field.id} style={styles.fieldBlock}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.label,
                    marginBottom: 4,
                  }}>
                  {label}
                </Text>
                <Text style={styles.multiHint}>{t('survey.multiHint')}</Text>
                {opts.map(o => {
                  const on = selected.includes(o.value);
                  return (
                    <AppPressable
                      key={o.value}
                      style={styles.multiRow}
                      onPress={() => toggleMulti(key, o.value)}>
                      <Text style={styles.check}>{on ? '✓' : ' '}</Text>
                      <Text style={styles.multiLabel}>{o.label}</Text>
                    </AppPressable>
                  );
                })}
              </View>
            );
          }

          return (
            <View key={field.id} style={styles.fieldBlock}>
              <Text style={styles.sub}>
                {label} ({field.input_type})
              </Text>
            </View>
          );
        })}

        <View style={styles.actions}>
          <AppPressable
            style={[styles.primary, submitting ? styles.primaryDisabled : null]}
            onPress={onPrimaryPress}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryText}>
                {isLast ? t('survey.submit') : t('survey.next')}
              </Text>
            )}
          </AppPressable>
          <AppPressable style={styles.secondary} onPress={onBackPress} disabled={submitting}>
            <Text style={styles.secondaryText}>{t('survey.back')}</Text>
          </AppPressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
