import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  completeLayer0,
  fetchOnboardingGeoHint,
  startPhoneVerification,
} from '../../api/onboardingApi';
import { AppPressable } from '../../components/AppPressable';
import { LAYER0_ARCHETYPES } from '../../constants/layer0Archetypes';
import {
  isLayer0CountryCode,
  LAYER0_COUNTRIES,
  layer0LanguagesForCountry,
} from '../../constants/layer0Countries';
import { useAuth } from '../../auth/AuthContext';
import { useLocale } from '../../locale';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeContext';

const E164_RE = /^\+[1-9]\d{6,14}$/;
const CONSENT_VERSION = 'v1.1';

type Step = 0 | 1 | 2 | 3 | 4;

type ConsentCardItem = { title: string; body: string };

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingLayer0'>;

export default function Layer0OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const { token, updateSessionUser } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [archetype, setArchetype] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [primaryLanguage, setPrimaryLanguage] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [consentPage, setConsentPage] = useState(0);
  const consentListRef = useRef<FlatList<ConsentCardItem>>(null);

  const pageWidth = useMemo(() => Dimensions.get('window').width - 40, []);

  useEffect(() => {
    if (step !== 2 || !token) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const hint = await fetchOnboardingGeoHint(token);
      if (cancelled || !hint || !isLayer0CountryCode(hint)) {
        return;
      }
      setCountry(hint);
    })();
    return () => {
      cancelled = true;
    };
  }, [step, token]);

  const languageOptions = useMemo(() => layer0LanguagesForCountry(country), [country]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 14,
        },
        backBtn: {
          paddingVertical: 8,
          paddingRight: 16,
        },
        backTxt: {
          color: colors.primary,
          fontSize: 16,
          fontWeight: '600',
        },
        title: {
          fontSize: 26,
          fontWeight: '800',
          letterSpacing: -0.5,
          color: colors.text,
          marginBottom: 8,
        },
        sub: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 20,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.label,
          marginBottom: 8,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.inputBackground,
          marginBottom: 14,
        },
        hint: {
          fontSize: 13,
          color: colors.textMuted,
          marginBottom: 18,
        },
        primaryBtn: {
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          marginTop: 8,
        },
        primaryTxt: {
          color: colors.onPrimary,
          fontSize: 16,
          fontWeight: '700',
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        cardTitle: {
          fontSize: 17,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 8,
        },
        cardBody: {
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
        },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        chip: {
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        chipOn: {
          borderColor: colors.primary,
          backgroundColor: colors.chipSelectedBackground,
        },
        chipTxt: { fontSize: 15, fontWeight: '600', color: colors.text },
        chipTxtOn: { color: colors.primary },
      }),
    [colors, insets.top, insets.bottom],
  );

  const consentCards = useMemo(
    () => [
      { title: t('onboarding.consentCard1Title'), body: t('onboarding.consentCard1Body') },
      { title: t('onboarding.consentCard2Title'), body: t('onboarding.consentCard2Body') },
      { title: t('onboarding.consentCard3Title'), body: t('onboarding.consentCard3Body') },
    ],
    [t],
  );

  const goBack = () => {
    if (step === 0) {
      navigation.replace('Login');
      return;
    }
    setStep((s) => (s - 1) as Step);
  };

  const goPhoneNext = () => {
    const p = phone.trim();
    if (!E164_RE.test(p)) {
      Alert.alert(t('onboarding.errorTitle'), t('onboarding.phonePh'));
      return;
    }
    const code = smsCode.trim();
    if (code.length < 4) {
      Alert.alert(t('onboarding.errorTitle'), t('onboarding.otpLabel'));
      return;
    }
    setStep(1);
  };

  const onSendSms = async () => {
    const p = phone.trim();
    if (!E164_RE.test(p)) {
      Alert.alert(t('onboarding.errorTitle'), t('onboarding.phonePh'));
      return;
    }
    if (!token) {
      return;
    }
    setSmsSending(true);
    try {
      const sent = await startPhoneVerification(token, p);
      if (!sent.ok) {
        Alert.alert(t('onboarding.errorTitle'), sent.message || t('onboarding.sendSmsFail'));
        return;
      }
    } finally {
      setSmsSending(false);
    }
  };

  const submitAll = async () => {
    if (!token || !archetype || !country || !primaryLanguage) {
      return;
    }
    setBusy(true);
    try {
      const res = await completeLayer0(token, {
        phone: phone.trim(),
        smsCode: smsCode.trim(),
        archetype,
        country,
        primaryLanguage,
        consentVersion: CONSENT_VERSION,
      });
      if (!res.ok) {
        Alert.alert(t('onboarding.errorTitle'), res.message);
        return;
      }
      await updateSessionUser(res.user);
      navigation.replace('OnboardingValuePrimer');
    } finally {
      setBusy(false);
    }
  };

  const onConsentScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / pageWidth);
    setConsentPage(Math.min(consentCards.length - 1, Math.max(0, i)));
  };

  useEffect(() => {
    if (step !== 4) {
      setConsentPage(0);
      consentListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [step]);

  const renderConsentStep = () => (
    <>
      <Text style={styles.title}>{t('onboarding.consentTitle')}</Text>
      <Text style={styles.sub}>{t('onboarding.consentSwipeHint')}</Text>
      <FlatList
        ref={consentListRef}
        data={consentCards}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={onConsentScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width: pageWidth }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 14,
        }}>
        {consentCards.map((_, i) => (
          <View
            key={`consent-dot-${i}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: i === consentPage ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      <AppPressable
        style={[styles.primaryBtn, busy && { opacity: 0.75 }]}
        onPress={() => {
          if (consentPage < consentCards.length - 1) {
            const next = consentPage + 1;
            consentListRef.current?.scrollToOffset({
              offset: next * pageWidth,
              animated: true,
            });
            setConsentPage(next);
          } else {
            submitAll();
          }
        }}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryTxt}>
            {consentPage < consentCards.length - 1
              ? t('onboarding.consentNext')
              : t('onboarding.consentAgree')}
          </Text>
        )}
      </AppPressable>
    </>
  );

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <Text style={styles.title}>{t('onboarding.phoneTitle')}</Text>
          <Text style={styles.sub}>{t('onboarding.phoneSub')}</Text>
          <Text style={styles.label}>{t('onboarding.phoneLabel')}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('onboarding.phonePh')}
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <AppPressable
            style={[styles.primaryBtn, { marginBottom: 8 }, smsSending && { opacity: 0.75 }]}
            onPress={onSendSms}
            disabled={smsSending || !token}>
            {smsSending ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryTxt}>{t('onboarding.sendSms')}</Text>
            )}
          </AppPressable>
          <Text style={styles.label}>{t('onboarding.otpLabel')}</Text>
          <TextInput
            style={styles.input}
            value={smsCode}
            onChangeText={setSmsCode}
            placeholder="123456"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            maxLength={10}
            textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : undefined}
          />
          <Text style={styles.hint}>{t('onboarding.otpHint')}</Text>
          <AppPressable style={styles.primaryBtn} onPress={goPhoneNext}>
            <Text style={styles.primaryTxt}>{t('onboarding.continue')}</Text>
          </AppPressable>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>{t('onboarding.archetypeTitle')}</Text>
          {LAYER0_ARCHETYPES.map(item => {
            const on = archetype === item.id;
            return (
              <AppPressable
                key={item.id}
                style={[styles.card, on && { borderColor: colors.primary }]}
                onPress={() => setArchetype(item.id)}>
                <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.cardBody}>{t(item.bodyKey)}</Text>
              </AppPressable>
            );
          })}
          <AppPressable
            style={styles.primaryBtn}
            onPress={() => {
              if (!archetype) {
                Alert.alert(t('onboarding.errorTitle'), t('onboarding.archetypeTitle'));
                return;
              }
              setStep(2);
            }}>
            <Text style={styles.primaryTxt}>{t('onboarding.continue')}</Text>
          </AppPressable>
        </>
      );
    }

    if (step === 2) {
      const q = countrySearch.trim().toLowerCase();
      const countriesFiltered = q
        ? LAYER0_COUNTRIES.filter(
            c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
          )
        : LAYER0_COUNTRIES;
      return (
        <>
          <Text style={styles.title}>{t('onboarding.countryTitle')}</Text>
          <Text style={styles.sub}>{t('onboarding.countrySub')}</Text>
          <TextInput
            style={styles.input}
            value={countrySearch}
            onChangeText={setCountrySearch}
            placeholder={t('onboarding.countrySearchPh')}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
            {countriesFiltered.map(c => {
              const on = country === c.code;
              return (
                <AppPressable
                  key={c.code}
                  style={[styles.card, on && { borderColor: colors.primary }]}
                  onPress={() => setCountry(c.code)}>
                  <Text style={styles.cardTitle}>{c.name}</Text>
                </AppPressable>
              );
            })}
          </ScrollView>
          <AppPressable
            style={styles.primaryBtn}
            onPress={() => {
              if (!country) {
                Alert.alert(t('onboarding.errorTitle'), t('onboarding.countryTitle'));
                return;
              }
              setStep(3);
            }}>
            <Text style={styles.primaryTxt}>{t('onboarding.continue')}</Text>
          </AppPressable>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <Text style={styles.title}>{t('onboarding.langTitle')}</Text>
          <View style={styles.chipRow}>
            {languageOptions.map(lang => {
              const on = primaryLanguage === lang.code;
              return (
                <AppPressable
                  key={lang.code}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setPrimaryLanguage(lang.code)}>
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{lang.label}</Text>
                </AppPressable>
              );
            })}
          </View>
          <AppPressable
            style={[styles.primaryBtn, { marginTop: 24 }]}
            onPress={() => {
              if (!primaryLanguage) {
                Alert.alert(t('onboarding.errorTitle'), t('onboarding.langTitle'));
                return;
              }
              setStep(4);
            }}>
            <Text style={styles.primaryTxt}>{t('onboarding.continue')}</Text>
          </AppPressable>
        </>
      );
    }

    return null;
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <AppPressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backTxt}>{t('onboarding.back')}</Text>
        </AppPressable>
      </View>
      {step === 4 ? (
        <View style={{ flex: 1 }}>{renderConsentStep()}</View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>
      )}
    </View>
  );
}
