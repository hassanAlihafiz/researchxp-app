import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

function ThemedAppShell() {
  const { colors, colorScheme } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
        animated
      />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider style={styles.flex}>
        <ThemeProvider>
          <ThemedAppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});

export default App;
