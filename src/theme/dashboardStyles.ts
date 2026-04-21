import { StyleSheet } from 'react-native';
import type { AppPalette } from './palettes';

const CARD_RADIUS = 16;

/**
 * Shared typography and surfaces for tab + drawer screens (matches auth / brand).
 */
export function createDashboardStyles(colors: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    /** Main screen title (Home, Rewards, …) */
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.6,
      marginBottom: 8,
    },
    /** One line under the main title */
    screenLead: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 22,
    },
    /** Secondary section title (e.g. “Surveys”, “Recent activity”) */
    sectionHeading: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.35,
      marginTop: 18,
      marginBottom: 14,
    },
    /** Small uppercase label above a block */
    overline: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    /** Body copy */
    paragraph: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSecondary,
      marginBottom: 14,
    },
    paragraphLast: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSecondary,
      marginBottom: 0,
    },
    hint: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginTop: 8,
    },
    cardsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
      marginBottom: 18,
    },
    statCard: {
      flexGrow: 1,
      flexBasis: '30%',
      minWidth: 120,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: CARD_RADIUS,
      padding: 14,
      marginHorizontal: 6,
      marginVertical: 6,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.9,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: CARD_RADIUS,
      padding: 16,
      marginBottom: 12,
    },
    listCardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
      marginBottom: 6,
    },
    listCardMeta: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    elevatedBlock: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: CARD_RADIUS,
      padding: 18,
      marginBottom: 20,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 6,
    },
    fieldValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 22,
    },
    themeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 10,
      rowGap: 10,
      marginBottom: 8,
    },
    themeChip: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    themeChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.chipSelectedBackground,
    },
    themeChipText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    themeChipTextActive: {
      color: colors.primary,
    },
    buttonSecondary: {
      alignSelf: 'flex-start',
      backgroundColor: colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderWidth: 1,
      borderColor: colors.buttonSecondaryBorder,
    },
    buttonSecondaryText: {
      color: colors.buttonSecondaryText,
      fontSize: 15,
      fontWeight: '600',
    },
    activityRowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 6,
    },
    activityTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.15,
    },
    activityDelta: {
      fontSize: 15,
      fontWeight: '800',
    },
  });
}

export const dashboardHeaderTitleStyle = (colors: AppPalette) => ({
  fontSize: 17,
  fontWeight: '800' as const,
  letterSpacing: -0.35,
  color: colors.text,
});
