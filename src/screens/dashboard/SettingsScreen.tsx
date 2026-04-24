import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { updateMyPassword } from '../../api/memberProfile';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { PasswordField } from '../../components/PasswordField';
import { APP_LANGUAGES, useLocale, type AppLanguage } from '../../locale';
import type { MainDrawerParamList } from '../../navigation/types';
import type { ColorScheme } from '../../theme/palettes';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

const LANGUAGE_LABEL_KEYS: Record<AppLanguage, string> = {
  en: 'settings.languageEnglish',
  fr: 'settings.languageFrench',
  es: 'settings.languageSpanish',
};

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorScheme, setColorScheme } = useAppTheme();
  const { t, language, setLanguage } = useLocale();
  const { token } = useAuth();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const modalStyles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderBottomWidth: 0,
          maxHeight: '92%',
          paddingBottom: Math.max(insets.bottom, 16),
        },
        sheetHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        sheetTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.3,
        },
        closeBtn: {
          paddingVertical: 8,
          paddingHorizontal: 4,
        },
        closeBtnText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.primary,
        },
        sheetBody: {
          paddingHorizontal: 20,
          paddingTop: 18,
        },
        field: { marginBottom: 14 },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        passwordHint: {
          fontSize: 13,
          lineHeight: 19,
          color: colors.textMuted,
          marginBottom: 16,
        },
        saveButton: {
          marginTop: 8,
          marginBottom: 8,
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
        openPasswordBtn: {
          alignSelf: 'flex-start',
          backgroundColor: colors.buttonSecondary,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 22,
          borderWidth: 1,
          borderColor: colors.buttonSecondaryBorder,
        },
        openPasswordBtnText: {
          color: colors.buttonSecondaryText,
          fontSize: 15,
          fontWeight: '600',
        },
        passwordSectionHint: {
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 14,
        },
        langRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          paddingHorizontal: 4,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        langRowLast: {
          borderBottomWidth: 0,
        },
        langRowLabel: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        langRowCheck: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.primary,
        },
      }),
    [colors, insets.bottom],
  );

  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  const closePasswordModal = useCallback(() => {
    if (passwordSaving) {
      return;
    }
    setPasswordModalVisible(false);
    resetPasswordForm();
  }, [passwordSaving, resetPasswordForm]);

  const selectScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  const onSelectLanguage = (code: AppLanguage) => {
    setLanguage(code);
    setLanguageModalVisible(false);
  };

  const onUpdatePassword = async () => {
    if (!token) {
      Alert.alert(
        t('settings.alertNotSignedInTitle'),
        t('settings.alertNotSignedInPasswordBody'),
      );
      return;
    }
    if (!currentPassword) {
      Alert.alert(
        t('settings.alertCurrentPasswordTitle'),
        t('settings.alertCurrentPasswordBody'),
      );
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(
        t('settings.alertNewShortTitle'),
        t('settings.alertNewShortBody'),
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('settings.alertMismatchTitle'),
        t('settings.alertMismatchBody'),
      );
      return;
    }
    setPasswordSaving(true);
    try {
      const result = await updateMyPassword(token, {
        currentPassword,
        newPassword,
      });
      if (!result.ok) {
        Alert.alert(
          t('settings.alertUpdateFailedTitle'),
          result.status === 401
            ? t('settings.alertWrongCurrentBody')
            : result.message,
        );
        return;
      }
      setPasswordModalVisible(false);
      resetPasswordForm();
      Alert.alert(
        t('settings.alertPasswordUpdatedTitle'),
        t('settings.alertPasswordUpdatedBody'),
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{
          paddingTop: DASHBOARD_SCROLL_PADDING_TOP,
          paddingBottom: insets.bottom + 28,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>{t('settings.screenTitle')}</Text>
        <Text style={styles.screenLead}>{t('settings.screenLead')}</Text>

        <Text style={styles.overline}>{t('settings.passwordOverline')}</Text>
        <View style={styles.elevatedBlock}>
          <Text style={modalStyles.passwordSectionHint}>
            {t('settings.passwordHint')}
          </Text>
          <AppPressable
            style={modalStyles.openPasswordBtn}
            onPress={() => setPasswordModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('settings.updatePasswordA11y')}>
            <Text style={modalStyles.openPasswordBtnText}>
              {t('settings.updatePassword')}
            </Text>
          </AppPressable>
        </View>

        <Text style={styles.overline}>{t('settings.appearanceOverline')}</Text>
        <View style={styles.themeRow}>
          <AppPressable
            onPress={() => selectScheme('light')}
            style={[
              styles.themeChip,
              colorScheme === 'light' && styles.themeChipActive,
            ]}>
            <Text
              style={[
                styles.themeChipText,
                colorScheme === 'light' && styles.themeChipTextActive,
              ]}>
              {t('settings.themeLight')}
            </Text>
          </AppPressable>
          <AppPressable
            onPress={() => selectScheme('dark')}
            style={[
              styles.themeChip,
              colorScheme === 'dark' && styles.themeChipActive,
            ]}>
            <Text
              style={[
                styles.themeChipText,
                colorScheme === 'dark' && styles.themeChipTextActive,
              ]}>
              {t('settings.themeDark')}
            </Text>
          </AppPressable>
        </View>

        <Text style={styles.overline}>{t('settings.languageOverline')}</Text>
        <View style={styles.elevatedBlock}>
          <Text style={modalStyles.passwordSectionHint}>
            {t('settings.languageHint')}
          </Text>
          <AppPressable
            style={modalStyles.openPasswordBtn}
            onPress={() => setLanguageModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('settings.selectLanguageA11y')}>
            <Text style={modalStyles.openPasswordBtnText}>
              {t('settings.selectLanguage')}
            </Text>
          </AppPressable>
        </View>
      </ScrollView>

      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closePasswordModal}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={modalStyles.overlay}>
            <AppPressable
              style={StyleSheet.absoluteFill}
              onPress={closePasswordModal}
              accessibilityLabel={t('settings.dismissA11y')}
            />
            <View style={modalStyles.sheet} pointerEvents="box-none">
              <View style={modalStyles.sheetHeader}>
                <Text style={modalStyles.sheetTitle}>
                  {t('settings.passwordModalTitle')}
                </Text>
                <AppPressable
                  onPress={closePasswordModal}
                  disabled={passwordSaving}
                  style={modalStyles.closeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.closeA11y')}>
                  <Text style={modalStyles.closeBtnText}>
                    {t('common.cancel')}
                  </Text>
                </AppPressable>
              </View>
              <ScrollView
                style={{ flexGrow: 0 }}
                contentContainerStyle={modalStyles.sheetBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <Text style={modalStyles.passwordHint}>
                  {t('settings.passwordModalHint')}
                </Text>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>
                    {t('settings.currentPassword')}
                  </Text>
                  <PasswordField
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="••••••••"
                    colors={colors}
                    editable={!passwordSaving}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>
                    {t('settings.newPassword')}
                  </Text>
                  <PasswordField
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('settings.newPasswordPlaceholder')}
                    colors={colors}
                    editable={!passwordSaving}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>
                    {t('settings.confirmNewPassword')}
                  </Text>
                  <PasswordField
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('settings.confirmNewPlaceholder')}
                    colors={colors}
                    editable={!passwordSaving}
                  />
                </View>
                <AppPressable
                  style={[
                    modalStyles.saveButton,
                    passwordSaving && modalStyles.saveButtonDisabled,
                  ]}
                  onPress={onUpdatePassword}
                  disabled={passwordSaving}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.saveNewPasswordA11y')}>
                  {passwordSaving ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={modalStyles.saveText}>
                      {t('settings.saveNewPassword')}
                    </Text>
                  )}
                </AppPressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <AppPressable
            style={StyleSheet.absoluteFill}
            onPress={() => setLanguageModalVisible(false)}
            accessibilityLabel={t('settings.dismissA11y')}
          />
          <View style={modalStyles.sheet} pointerEvents="box-none">
            <View style={modalStyles.sheetHeader}>
              <Text style={modalStyles.sheetTitle}>
                {t('settings.languageModalTitle')}
              </Text>
              <AppPressable
                onPress={() => setLanguageModalVisible(false)}
                style={modalStyles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel={t('settings.closeA11y')}>
                <Text style={modalStyles.closeBtnText}>
                  {t('common.cancel')}
                </Text>
              </AppPressable>
            </View>
            <View style={modalStyles.sheetBody}>
              {APP_LANGUAGES.map((code, index) => (
                <AppPressable
                  key={code}
                  style={[
                    modalStyles.langRow,
                    index === APP_LANGUAGES.length - 1 && modalStyles.langRowLast,
                  ]}
                  onPress={() => onSelectLanguage(code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === code }}>
                  <Text style={modalStyles.langRowLabel}>
                    {t(LANGUAGE_LABEL_KEYS[code])}
                  </Text>
                  {language === code ? (
                    <Text style={modalStyles.langRowCheck}>✓</Text>
                  ) : (
                    <View style={{ width: 18 }} />
                  )}
                </AppPressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
