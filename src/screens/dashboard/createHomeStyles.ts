import { StyleSheet } from 'react-native';
import type { AppPalette, ColorScheme } from '../../theme/palettes';

export function createHomeStyles(colors: AppPalette, _scheme: ColorScheme) {
  /** Hero card uses primary CTA color (Pulse cyan / royal) */
  const heroBackground = colors.primary;
  const heroBorder = 'rgba(255,255,255,0.28)';
  const heroLabel = 'rgba(255,255,255,0.95)';

  return StyleSheet.create({
    scrollRoot: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
    },
    balanceHero: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: heroBorder,
      backgroundColor: heroBackground,
      paddingVertical: 22,
      paddingHorizontal: 20,
      marginBottom: 22,
      overflow: 'hidden',
    },
    balanceHeroInner: {
      width: '100%',
      alignItems: 'flex-start',
    },
    balanceLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: heroLabel,
      marginBottom: 6,
    },
    balanceValue: {
      fontSize: 32,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.8,
      marginBottom: 14,
    },
    /** Rewards: main XP row when stats live below inside the hero */
    balanceValueRewardsHeroOnly: {
      marginBottom: 0,
    },
    /** Rewards: two-up stats row inside balance hero */
    balanceHeroStatsRow: {
      flexDirection: 'row',
      marginTop: 18,
      paddingTop: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(255,255,255,0.35)',
      width: '100%',
      gap: 12,
    },
    balanceHeroStat: {
      flex: 1,
      minWidth: 0,
    },
    balanceHeroStatLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.78)',
      textTransform: 'uppercase',
      letterSpacing: 0.55,
      marginBottom: 6,
    },
    balanceHeroStatValue: {
      fontSize: 19,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: -0.35,
    },
    heroViewRewards: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth + 1,
      borderColor: 'rgba(255,255,255,0.9)',
    },
    heroViewRewardsText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
      marginBottom: 14,
    },
    surveyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    surveyTexts: {
      flex: 1,
      minWidth: 0,
    },
    surveyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
      marginBottom: 4,
    },
    surveySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
    surveyXp: {
      fontSize: 16,
      fontWeight: '800',
      marginLeft: 8,
      letterSpacing: -0.2,
      color: colors.primary,
    },
    viewAllSurveysBtn: {
      marginTop: 6,
      marginBottom: 8,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewAllSurveysText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    statusLine: {
      marginTop: 4,
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    mutedBody: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    /** Shared card surface (Profile blocks, etc.) */
    surfaceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      marginBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
  });
}
