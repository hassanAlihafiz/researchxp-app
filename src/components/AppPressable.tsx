import { Platform, Pressable, type PressableProps } from 'react-native';

/**
 * Pressable without Android's default foreground ripple (often an oversized circle).
 * Pass `android_ripple` if you want a bounded custom ripple.
 */
export function AppPressable({ android_ripple, ...rest }: PressableProps) {
  return (
    <Pressable
      {...rest}
      android_ripple={
        Platform.OS === 'android' ? android_ripple ?? null : android_ripple
      }
    />
  );
}
