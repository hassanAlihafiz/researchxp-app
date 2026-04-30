import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppPressable } from '../components/AppPressable';
import { DrawerMenuButton } from './DrawerMenuButton';
import { ResearchLogo } from '../components/ResearchLogo';
import { useLocale } from '../locale';
import { useAppTheme } from '../theme/ThemeContext';

/** Lockup (mark + wordmark) needs more width than wordmark-only for the same visual weight. */
const HEADER_LOGO_WIDTH = 168;

/** Main tabs (Home, Rewards, Profile): ☰ left, logo, notifications bell right. */
export function MainTabHeaderLeading() {
  return (
    <View style={styles.leading}>
      <DrawerMenuButton />
      <ResearchLogo width={HEADER_LOGO_WIDTH} containerStyle={styles.logoContainer} />
    </View>
  );
}

export function MainTabHeaderTrailing() {
  const { colors } = useAppTheme();
  const { t } = useLocale();
  return (
    <View style={styles.trailing}>
      <AppPressable
        onPress={() => {
          /* reserved for notifications */
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('home.notificationsA11y')}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </AppPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    flexShrink: 1,
    maxWidth: '88%',
        
  },
  logoContainer: {
    alignSelf: 'center',
    marginLeft: 4,
    marginRight: 4,
    paddingBottom: 12,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingVertical: 2,
  },
});
