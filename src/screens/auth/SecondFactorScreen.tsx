import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReactNativeBiometrics from 'react-native-biometrics';
import { verifySecondFactorCode } from '../../auth/mockAuth';
import { useAuth } from '../../auth/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SecondFactor'>;

const rnBiometrics = new ReactNativeBiometrics();

const SecondFactorScreen = ({ navigation, route }: Props) =>
   {
  const insets = useSafeAreaInsets();
  const { email } = route.params;
  const { signIn } = useAuth();

  const [biometryLabel, setBiometryLabel] = useState<string | null>(null);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { available, biometryType } =
          await rnBiometrics.isSensorAvailable();
        if (cancelled) {
          return;
        }
        setBiometryAvailable(Boolean(available && biometryType));
        if (biometryType === 'TouchID') {
          setBiometryLabel('Touch ID');
        } else if (biometryType === 'FaceID') {
          setBiometryLabel('Face ID');
        } else if (biometryType === 'Biometrics') {
          setBiometryLabel('Biometric unlock');
        } else {
          setBiometryLabel(null);
        }
      } catch {
        if (!cancelled) {
          setBiometryAvailable(false);
          setBiometryLabel(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goHome = useCallback(() => {
    signIn(email);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [signIn, email, navigation]);

  const onBiometric = async () => {
    setBusy(true);
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm it is you',
        cancelButtonText: 'Use code',
      });
      if (success) {
        goHome();
      }
    } catch {
      Alert.alert(
        'Biometrics',
        'Could not verify. Use the 6-digit code or try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onSubmitCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Code', 'Enter all 6 digits.');
      return;
    }
    setBusy(true);
    try {
      const ok = await verifySecondFactorCode(code);
      if (ok) {
        goHome();
      } else {
        Alert.alert('Code', 'Invalid code. Demo code is 123456.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Verify it is you</Text>
      <Text style={styles.subtitle}>
        {biometryAvailable
          ? `Use ${biometryLabel ?? 'biometrics'}, or enter the 6-digit code sent to your email.`
          : 'Biometrics are not available on this device. Enter the 6-digit code sent to your email.'}
      </Text>

      {biometryAvailable ? (
        <Pressable
          style={[styles.button, styles.buttonSecondary, busy && styles.busy]}
          onPress={onBiometric}
          disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#f2f4f7" />
          ) : (
            <Text style={styles.buttonSecondaryText}>
              Continue with {biometryLabel ?? 'Face ID / Touch ID'}
            </Text>
          )}
        </Pressable>
      ) : null}

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>
          {biometryAvailable ? 'or use code' : 'verification code'}
        </Text>
        <View style={styles.divider} />
      </View>

      <Text style={styles.label}>6-digit code</Text>
      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="••••••"
        placeholderTextColor="#555"
        editable={!busy}
      />

      <Pressable
        style={[styles.button, busy && styles.busy]}
        onPress={onSubmitCode}
        disabled={busy}>
        <Text style={styles.buttonText}>Verify code</Text>
      </Pressable>
    </View>
  );
};
export default SecondFactorScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#0b0f14',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f2f4f7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9aa4b2',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  buttonSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonSecondaryText: {
    color: '#f2f4f7',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  busy: {
    opacity: 0.75,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2a3441',
  },
  dividerText: {
    color: '#6b7788',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c8d0dc',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#2a3441',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 22,
    letterSpacing: 6,
    color: '#f2f4f7',
    backgroundColor: '#121822',
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
});
