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

/** Source assets: 609×158 px */
const LOGO_ASPECT = 609 / 158;

const logoForLightBackground = require('../assets/ResearchXPLogo-03.png');
const logoForDarkBackground = require('../assets/ResearchXPLogoWhite-03.png');

type Props = {
  /** Total width of the wordmark (height derived from asset aspect ratio). */
  width?: number;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function ResearchLogo({
  width = 240,
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
    alignSelf: 'center',
  },
  image: {
    alignSelf: 'center',
  },
});
