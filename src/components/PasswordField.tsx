import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppPalette } from '../theme/palettes';
import { AppPressable } from './AppPressable';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  colors: AppPalette;
  editable?: boolean;
  /** Accessibility label for the visibility toggle (optional). */
  testID?: string;
};

export function PasswordField({
  value,
  onChangeText,
  placeholder,
  colors,
  editable = true,
}: Props) {
  const [visible, setVisible] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: 'relative',
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingLeft: 14,
          paddingRight: 48,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
        },
        eye: {
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 48,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
      />
      <AppPressable
        style={styles.eye}
        onPress={() => setVisible(v => !v)}
        hitSlop={8}
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        accessibilityRole="button"
        disabled={!editable}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.textSecondary}
        />
      </AppPressable>
    </View>
  );
}
