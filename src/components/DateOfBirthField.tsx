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

export type DateOfBirthLocaleStrings = {
  tapToChoose: string;
  clear: string;
  iosCancel: string;
  iosDone: string;
  iosTitle: string;
  chooseA11y: string;
  clearA11y: string;
  closePickerA11y: string;
};

const DOB_COPY_DEFAULT: DateOfBirthLocaleStrings = {
  tapToChoose: 'Tap to choose a date',
  clear: 'Clear',
  iosCancel: 'Cancel',
  iosDone: 'Done',
  iosTitle: 'Date of birth',
  chooseA11y: 'Choose date of birth',
  clearA11y: 'Clear date of birth',
  closePickerA11y: 'Close date picker',
};

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
  /** Localized strings for the picker UI (defaults to English). */
  localeStrings?: Partial<DateOfBirthLocaleStrings>;
  /** When the user opens the date field (e.g. scroll row to center). */
  onFieldPress?: () => void;
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
  localeStrings,
  onFieldPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const copy = useMemo(
    () => ({ ...DOB_COPY_DEFAULT, ...localeStrings }),
    [localeStrings],
  );
  const [open, setOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState(value ?? DEFAULT_FALLBACK_DATE);

  const openPicker = useCallback(() => {
    onFieldPress?.();
    setIosTemp(value ?? DEFAULT_FALLBACK_DATE);
    setOpen(true);
  }, [value, onFieldPress]);

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

  const max = useMemo(() => maxDate ?? new Date(), [maxDate]);

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
          accessibilityLabel={copy.chooseA11y}>
          <Text
            style={[styles.dobText, !value && styles.dobPlaceholder]}>
            {value
              ? formatDateDisplay(value)
              : copy.tapToChoose}
          </Text>
        </AppPressable>
        {showClear && value ? (
          <AppPressable
            style={styles.clearDob}
            onPress={() => onChange(null)}
            hitSlop={8}
            disabled={disabled}
            accessibilityLabel={copy.clearA11y}>
            <Text style={styles.clearDobText}>{copy.clear}</Text>
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
              accessibilityLabel={copy.closePickerA11y}
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
                    {copy.iosCancel}
                  </Text>
                </AppPressable>
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  {copy.iosTitle}
                </Text>
                <AppPressable onPress={confirmIos} hitSlop={12}>
                  <Text style={[styles.modalBtn, styles.modalDone]}>
                    {copy.iosDone}
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
