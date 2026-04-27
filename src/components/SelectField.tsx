import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from './AppPressable';
import type { AppPalette } from '../theme/palettes';

export type SelectOption = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  colors: AppPalette;
  disabled?: boolean;
  /** Long lists (e.g. countries): show search box in the modal. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown in modal header and a11y */
  modalTitle: string;
  closeA11yLabel: string;
  noResultsLabel: string;
  onOpen?: () => void;
};

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  colors,
  disabled = false,
  searchable = false,
  searchPlaceholder = '',
  modalTitle,
  closeA11yLabel,
  noResultsLabel,
  onOpen,
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const displayLabel = useMemo(() => {
    if (!value.trim()) {
      return '';
    }
    const found = options.find(o => o.value === value);
    return found ? found.label : value;
  }, [value, options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter(
      o =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  const openModal = useCallback(() => {
    if (disabled) {
      return;
    }
    setQuery('');
    onOpen?.();
    setOpen(true);
  }, [disabled, onOpen]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        trigger: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          backgroundColor: colors.inputBackground,
          minHeight: Platform.OS === 'ios' ? 48 : 44,
        },
        triggerDisabled: { opacity: 0.55 },
        triggerText: {
          flex: 1,
          fontSize: 16,
          color: colors.text,
        },
        triggerPlaceholder: {
          color: colors.placeholder,
        },
        chevron: {
          fontSize: 14,
          color: colors.textMuted,
          marginLeft: 8,
        },
        modalRoot: {
          flex: 1,
          backgroundColor: colors.background,
        },
        modalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        modalTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          flex: 1,
        },
        closeBtn: {
          paddingVertical: 8,
          paddingHorizontal: 4,
        },
        closeText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.primary,
        },
        search: {
          marginHorizontal: 16,
          marginVertical: 10,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: Platform.OS === 'ios' ? 10 : 8,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
        },
        row: {
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        rowText: {
          fontSize: 16,
          color: colors.text,
        },
        rowSelected: {
          fontWeight: '600',
          color: colors.primary,
        },
        empty: {
          padding: 24,
          textAlign: 'center',
          color: colors.textMuted,
          fontSize: 15,
        },
      }),
    [colors],
  );

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <AppPressable
        onPress={openModal}
        disabled={disabled}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${displayLabel || placeholder}`}
        accessibilityHint={modalTitle}>
        <Text
          style={[
            styles.triggerText,
            !displayLabel && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}>
          {displayLabel || placeholder}
        </Text>
        <Text style={styles.chevron} pointerEvents="none">
          ▼
        </Text>
      </AppPressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}>
        <View style={[styles.modalRoot, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <AppPressable
              onPress={closeModal}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={closeA11yLabel}
              hitSlop={12}>
              <Text style={styles.closeText}>{closeA11yLabel}</Text>
            </AppPressable>
          </View>
          {searchable ? (
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.placeholder}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
            />
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={item => item.value}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={32}
            windowSize={10}
            ListEmptyComponent={
              <Text style={styles.empty}>{noResultsLabel}</Text>
            }
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <AppPressable
                  style={styles.row}
                  onPress={() => {
                    onChange(item.value);
                    closeModal();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}>
                  <Text
                    style={[styles.rowText, selected && styles.rowSelected]}>
                    {item.label}
                  </Text>
                </AppPressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
