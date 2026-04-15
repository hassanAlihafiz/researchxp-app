import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.body}>
        Add support links, FAQs, or contact options here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#0b0f14',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f2f4f7',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: '#9aa4b2',
    lineHeight: 22,
  },
});
