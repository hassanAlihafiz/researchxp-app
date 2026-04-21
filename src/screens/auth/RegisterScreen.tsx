import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ResearchLogo } from '../../components/ResearchLogo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerMember } from '../../api/registerMember';
import { useAuth } from '../../auth/AuthContext';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

const RegisterScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [education, setEducation] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        },
        logo: {
          marginBottom: 8,
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 28,
        },
        field: {
          marginBottom: 18,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        hint: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 6,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
        },
        button: {
          marginTop: 8,
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingVertical: 16,
          alignItems: 'center',
        },
        buttonDisabled: {
          opacity: 0.7,
        },
        buttonText: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '600',
        },
        footer: {
          marginTop: 20,
          alignItems: 'center',
        },
        footerText: {
          fontSize: 15,
          color: colors.textSecondary,
        },
        footerLink: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
          marginTop: 6,
        },
      }),
    [colors],
  );

  const onSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDob = dob.trim();

    if (!trimmedName) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Re-enter your password to confirm.');
      return;
    }
    if (trimmedDob && !DOB_RE.test(trimmedDob)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD or leave date of birth empty.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerMember({
        name: trimmedName,
        email: trimmedEmail,
        password,
        dob: trimmedDob || null,
        education: education.trim() || null,
      });

      if (!result.ok) {
        Alert.alert('Registration failed', result.message);
        return;
      }

      signIn(trimmedEmail);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        <ResearchLogo width={220} containerStyle={styles.logo} />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Join ResearchXP with the same details you use on the web.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Jane Doe"
            placeholderTextColor={colors.placeholder}
            editable={!loading}
          />
        </View>

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
            placeholderTextColor={colors.placeholder}
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
            placeholder="At least 8 characters"
            placeholderTextColor={colors.placeholder}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.placeholder}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of birth (optional)</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
            editable={!loading}
          />
          <Text style={styles.hint}>Must match server format if provided.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Education (optional)</Text>
          <TextInput
            style={styles.input}
            value={education}
            onChangeText={setEducation}
            placeholder="e.g. Bachelor's in Biology"
            placeholderTextColor={colors.placeholder}
            editable={!loading}
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            hitSlop={12}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
