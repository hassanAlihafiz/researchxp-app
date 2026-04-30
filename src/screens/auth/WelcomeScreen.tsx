import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { oauthApple, oauthGoogle } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { AppPressable } from '../../components/AppPressable';
import { ResearchLogo } from '../../components/ResearchLogo';
import { useLocale } from '../../locale';
import { replaceStackAfterAuth } from '../../navigation/afterAuthNavigation';
import type { RootStackParamList } from '../../navigation/types';
import { ensureGoogleSignInConfigured, isGoogleSignInConfigured } from '../../services/googleSignIn';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const { signInWithSession } = useAuth();
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scroll: {
          flexGrow: 1,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          alignItems: 'center',
        },
        logo: { marginBottom: 28 },
        headline: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.text,
          textAlign: 'center',
          letterSpacing: -0.4,
          marginBottom: 10,
        },
        sub: {
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 32,
        },
        primary: {
          width: '100%',
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          marginBottom: 12,
        },
        primaryTxt: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '700',
        },
        secondary: {
          width: '100%',
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          marginBottom: 12,
        },
        secondaryDisabled: {
          opacity: 0.55,
        },
        secondaryTxt: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
        },
        foot: {
          marginTop: 'auto',
          paddingTop: 20,
        },
        terms: {
          fontSize: 13,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 20,
        },
        signInRow: {
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        },
        signIn: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
        },
      }),
    [colors, insets],
  );

  const onApple = async () => {
    if (!appleAuth.isSupported) {
      Alert.alert(t('welcome.appleUnsupportedTitle'), t('welcome.appleUnsupportedBody'), [
        { text: t('common.ok') },
      ]);
      return;
    }
    try {
      setBusy('apple');
      const res = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      const state = await appleAuth.getCredentialStateForUser(res.user);
      if (state !== appleAuth.State.AUTHORIZED) {
        Alert.alert(t('welcome.oauthFailTitle'), t('welcome.appleNotAuthorized'));
        return;
      }
      if (!res.identityToken) {
        Alert.alert(t('welcome.oauthFailTitle'), t('welcome.appleNoToken'));
        return;
      }
      const fn = res.fullName;
      const fullName =
        fn && (fn.givenName || fn.familyName)
          ? {
              givenName: fn.givenName ?? undefined,
              familyName: fn.familyName ?? undefined,
            }
          : undefined;
      const api = await oauthApple(res.identityToken, fullName);
      if (!api.ok) {
        Alert.alert(t('welcome.oauthFailTitle'), api.message);
        return;
      }
      const addr = api.user.email.trim().toLowerCase();
      await signInWithSession({
        email: addr,
        token: api.token,
        user: api.user,
      });
      replaceStackAfterAuth(navigation, api.user);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === appleAuth.Error.CANCELED
      ) {
        return;
      }
      const msg = e instanceof Error ? e.message : t('welcome.oauthUnknown');
      Alert.alert(t('welcome.oauthFailTitle'), msg);
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    if (!isGoogleSignInConfigured()) {
      Alert.alert(t('welcome.googleConfigTitle'), t('welcome.googleConfigBody'), [
        { text: t('common.ok') },
      ]);
      return;
    }
    try {
      setBusy('google');
      ensureGoogleSignInConfigured();
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const res = await GoogleSignin.signIn();
      if (res.type !== 'success') {
        return;
      }
      const idToken = res.data.idToken;
      if (!idToken) {
        Alert.alert(t('welcome.oauthFailTitle'), t('welcome.googleNoToken'));
        return;
      }
      const api = await oauthGoogle(idToken);
      if (!api.ok) {
        Alert.alert(t('welcome.oauthFailTitle'), api.message);
        return;
      }
      const addr = api.user.email.trim().toLowerCase();
      await signInWithSession({
        email: addr,
        token: api.token,
        user: api.user,
      });
      replaceStackAfterAuth(navigation, api.user);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      Alert.alert(t('welcome.oauthFailTitle'), err?.message || t('welcome.oauthUnknown'));
    } finally {
      setBusy(null);
    }
  };

  const showApple = Platform.OS === 'ios' && appleAuth.isSupported;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ResearchLogo width={272} containerStyle={styles.logo} />
        <Text style={styles.headline}>{t('welcome.headline')}</Text>
        <Text style={styles.sub}>{t('welcome.sub')}</Text>

        <AppPressable style={styles.primary} onPress={() => navigation.navigate('EmailSignUp')}>
          <Text style={styles.primaryTxt}>{t('welcome.continueEmail')}</Text>
        </AppPressable>
        {showApple ? (
          <AppPressable
            style={[styles.secondary, busy && styles.secondaryDisabled]}
            onPress={onApple}
            disabled={busy !== null}>
            {busy === 'apple' ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.secondaryTxt}>{t('welcome.apple')}</Text>
            )}
          </AppPressable>
        ) : null}
        <AppPressable
          style={[styles.secondary, busy && styles.secondaryDisabled]}
          onPress={onGoogle}
          disabled={busy !== null}>
          {busy === 'google' ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.secondaryTxt}>{t('welcome.google')}</Text>
          )}
        </AppPressable>

        <View style={styles.foot}>
          <Text style={styles.terms}>{t('welcome.terms')}</Text>
          <View style={styles.signInRow}>
            <Text style={{ color: colors.textSecondary }}>{t('welcome.signInLead')}</Text>
            <AppPressable onPress={() => navigation.navigate('Login')} hitSlop={10}>
              <Text style={styles.signIn}>{t('welcome.signIn')}</Text>
            </AppPressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
