import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loginWithPassword } from '../../auth/mockAuth';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) =>
   {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const result = await loginWithPassword(email, password);
      if (!result.ok) {
        Alert.alert('Sign in failed', result.message);
        return;
      }
      const trimmed = email.trim().toLowerCase();
      navigation.replace('SecondFactor', { email: trimmed });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        After email and password, you will confirm with Face ID / Touch ID when
        available, or a 6-digit code.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@company.com"
          placeholderTextColor="#888"
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#888"
          editable={!loading}
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>

      <Text style={styles.hint}>
        Demo MFA code when biometrics are not used:{' '}
        <Text style={styles.hintMono}>123456</Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#0b0f14',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f4f7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9aa4b2',
    lineHeight: 22,
    marginBottom: 28,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c8d0dc',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2a3441',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#f2f4f7',
    backgroundColor: '#121822',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: '#6b7788',
    lineHeight: 20,
  },
  hintMono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#9aa4b2',
  },
});
