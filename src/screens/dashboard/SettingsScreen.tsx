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
import type { MainDrawerParamList } from '../../navigation/types';
import type { ColorScheme } from '../../theme/palettes';
import {
  createDashboardStyles,
  DASHBOARD_SCROLL_PADDING_TOP,
} from '../../theme/dashboardStyles';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export default function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorScheme, setColorScheme } = useAppTheme();
  const { token } = useAuth();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
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

  const onUpdatePassword = async () => {
    if (!token) {
      Alert.alert('Not signed in', 'Sign in again to change your password.');
      return;
    }
    if (!currentPassword) {
      Alert.alert('Current password', 'Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('New password', 'Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
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
          'Could not update password',
          result.status === 401
            ? 'Current password is incorrect.'
            : result.message,
        );
        return;
      }
      setPasswordModalVisible(false);
      resetPasswordForm();
      Alert.alert('Password updated', 'Your password has been changed.');
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
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenLead}>
          Appearance and other preferences for your account.
        </Text>

        <Text style={styles.overline}>Password</Text>
        <View style={styles.elevatedBlock}>
          <Text style={modalStyles.passwordSectionHint}>
            Change your sign-in password. You will need your current password.
          </Text>
          <AppPressable
            style={modalStyles.openPasswordBtn}
            onPress={() => setPasswordModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open update password form">
            <Text style={modalStyles.openPasswordBtnText}>Update password</Text>
          </AppPressable>
        </View>

        <Text style={styles.overline}>Appearance</Text>
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
              Light
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
              Dark
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
              accessibilityLabel="Dismiss"
            />
            <View style={modalStyles.sheet} pointerEvents="box-none">
              <View style={modalStyles.sheetHeader}>
                <Text style={modalStyles.sheetTitle}>Update password</Text>
                <AppPressable
                  onPress={closePasswordModal}
                  disabled={passwordSaving}
                  style={modalStyles.closeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close">
                  <Text style={modalStyles.closeBtnText}>Cancel</Text>
                </AppPressable>
              </View>
              <ScrollView
                style={{ flexGrow: 0 }}
                contentContainerStyle={modalStyles.sheetBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <Text style={modalStyles.passwordHint}>
                  Enter your current password, then choose a new one (at least 8
                  characters).
                </Text>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>Current password</Text>
                  <PasswordField
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="••••••••"
                    colors={colors}
                    editable={!passwordSaving}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>New password</Text>
                  <PasswordField
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 8 characters"
                    colors={colors}
                    editable={!passwordSaving}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text style={modalStyles.label}>Confirm new password</Text>
                  <PasswordField
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat new password"
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
                  accessibilityLabel="Save new password">
                  {passwordSaving ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={modalStyles.saveText}>Save new password</Text>
                  )}
                </AppPressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
