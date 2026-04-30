import React from 'react';
import {
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

/** Horizontal lockups, trimmed to opaque bounds (~986×146). */
const LOGO_ASPECT = 986 / 146;

/** Light UI — `05-lockup-light` (mark + dark “Research” on transparent). */
const logoForLightBackground = require('../assets/lockup-for-light-bg.png');
/** Dark UI — `04-lockup-dark` (mark + light “Research” on transparent). */
const logoForDarkBackground = require('../assets/lockup-for-dark-bg.png');

type Props = {
  /** Display width of the lockup (height follows ~986:146 trimmed asset). */
  width?: number;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function ResearchLogo({
  width = 272,
  containerStyle,
  imageStyle,
}: Props) {
  const { colorScheme } = useAppTheme();
  const source =
    colorScheme === 'dark' ? logoForDarkBackground : logoForLightBackground;

  return (
    <View style={[styles.wrap, { width }, containerStyle]}>
      <Image
        accessibilityRole="image"
        accessibilityLabel="ResearchXP"
        source={source}
        resizeMode="contain"
        style={[
          styles.image,
          { width, height: width / LOGO_ASPECT },
          imageStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  image: {
    alignSelf: 'center',
  },
});
