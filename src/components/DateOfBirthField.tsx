import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from './AppPressable';
import type { AppPalette, ColorScheme } from '../theme/palettes';
import { formatDateDisplay } from '../utils/dateFormat';

const DEFAULT_MIN = new Date(1900, 0, 1);
const DEFAULT_FALLBACK_DATE = new Date(1995, 5, 15);

type Props = {
  value: Date | null;
  onChange: (next: Date | null) => void;
  colors: AppPalette;
  colorScheme: ColorScheme;
  label: string;
  /** Shown under the field (optional). */
  hint?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showClear?: boolean;
};

/**
 * Picker for calendar date of birth. Android: system dialog. iOS: bottom sheet
 * with spinner and Cancel / Done.
 */
export function DateOfBirthField({
  value,
  onChange,
  colors,
  colorScheme,
  label,
  hint,
  disabled = false,
  minDate = DEFAULT_MIN,
  maxDate,
  showClear = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState(value ?? DEFAULT_FALLBACK_DATE);

  const openPicker = useCallback(() => {
    setIosTemp(value ?? DEFAULT_FALLBACK_DATE);
    setOpen(true);
  }, [value]);

  const onAndroidValueChange = useCallback(
    (_event: unknown, date: Date) => {
      setOpen(false);
      onChange(date);
    },
    [onChange],
  );

  const onAndroidDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  const confirmIos = useCallback(() => {
    onChange(iosTemp);
    setOpen(false);
  }, [iosTemp, onChange]);

  const max = useMemo(
    () => maxDate ?? new Date(),
    [maxDate, open],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        field: { marginBottom: 16 },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        hint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
        dobRow: { flexDirection: 'row', alignItems: 'center' },
        dobPress: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 12,
          backgroundColor: colors.inputBackground,
          minHeight: 48,
          justifyContent: 'center',
        },
        dobText: { fontSize: 16, color: colors.text },
        dobPlaceholder: { color: colors.placeholder },
        clearDob: { marginLeft: 8, paddingVertical: 8, paddingHorizontal: 4 },
        clearDobText: { fontSize: 14, fontWeight: '600', color: colors.primary },
        modalSheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        modalBar: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        modalBtn: { fontSize: 17, fontWeight: '600' },
        modalCancel: { color: colors.textSecondary },
        modalDone: { color: colors.primary },
        /** UIDatePicker spinner needs a fixed height inside RN Modal or it can render empty (iOS). */
        iosPickerWrap: {
          width: '100%',
          height: 216,
          backgroundColor: colors.surface,
          alignItems: 'stretch' as const,
        },
        iosPicker: {
          width: '100%',
          height: 216,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dobRow}>
        <AppPressable
          style={styles.dobPress}
          onPress={openPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Choose date of birth">
          <Text
            style={[styles.dobText, !value && styles.dobPlaceholder]}>
            {value
              ? formatDateDisplay(value)
              : 'Tap to choose a date'}
          </Text>
        </AppPressable>
        {showClear && value ? (
          <AppPressable
            style={styles.clearDob}
            onPress={() => onChange(null)}
            hitSlop={8}
            disabled={disabled}
            accessibilityLabel="Clear date of birth">
            <Text style={styles.clearDobText}>Clear</Text>
          </AppPressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value ?? DEFAULT_FALLBACK_DATE}
          mode="date"
          display="default"
          onValueChange={onAndroidValueChange}
          onDismiss={onAndroidDismiss}
          maximumDate={max}
          minimumDate={minDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={open}
          animationType="slide"
          transparent
          onRequestClose={() => setOpen(false)}>
          <View style={{ flex: 1 }}>
            <AppPressable
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.45)' },
              ]}
              onPress={() => setOpen(false)}
              accessibilityLabel="Close date picker"
            />
            <View
              style={[
                styles.modalSheet,
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}>
              <View style={styles.modalBar}>
                <AppPressable onPress={() => setOpen(false)} hitSlop={12}>
                  <Text style={[styles.modalBtn, styles.modalCancel]}>
                    Cancel
                  </Text>
                </AppPressable>
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  Date of birth
                </Text>
                <AppPressable onPress={confirmIos} hitSlop={12}>
                  <Text style={[styles.modalBtn, styles.modalDone]}>
                    Done
                  </Text>
                </AppPressable>
              </View>
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={iosTemp}
                  mode="date"
                  display="spinner"
                  style={styles.iosPicker}
                  onValueChange={(_event, d) => setIosTemp(d)}
                  maximumDate={max}
                  minimumDate={minDate}
                  themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                  textColor={colors.text}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
