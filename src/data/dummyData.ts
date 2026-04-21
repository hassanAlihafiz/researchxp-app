export type RewardsSummary = {
  availableBalance: number;
  totalRedeemed: number;
  underReview: number;
};

export type SurveyListItem = {
  id: string;
  title: string;
  duration: string;
  pointsAwarded: number;
  dueIn?: string;
};

export type RewardsActivityItem = {
  id: string;
  title: string;
  date: string;
  points: number;
  status: 'completed' | 'pending' | 'under_review';
};

export const dummyRewardsSummary: RewardsSummary = {
  availableBalance: 100_000,
  totalRedeemed: 10_000,
  underReview: 10_000,
};

export const dummyRewardsActivity: RewardsActivityItem[] = [
  {
    id: 'activity_redeem_paypal_2026-04-10',
    title: 'Redeemed to PayPal',
    date: 'Apr 10',
    points: -5_000,
    status: 'completed',
  },
  {
    id: 'activity_survey_grocery_2026-04-12',
    title: 'Survey reward: Grocery visit',
    date: 'Apr 12',
    points: 1_500,
    status: 'completed',
  },
  {
    id: 'activity_survey_audit_2026-04-15',
    title: 'Survey reward: Availability audit',
    date: 'Apr 15',
    points: 2_250,
    status: 'under_review',
  },
  {
    id: 'activity_redeem_giftcard_2026-04-16',
    title: 'Gift card redemption',
    date: 'Apr 16',
    points: -3_000,
    status: 'pending',
  },
];

export const dummySurveys: SurveyListItem[] = [
  {
    id: 'survey_customer-satisfaction_grocery',
    title: 'Customer Satisfaction (Grocery)',
    duration: '10 min',
    pointsAwarded: 1_500,
    dueIn: '3 days',
  },
  {
    id: 'survey_mobile-app_usability-check',
    title: 'Mobile App Usability Check',
    duration: '7 min',
    pointsAwarded: 900,
    dueIn: '3 days',
  },
  {
    id: 'survey_in-store_product-availability-audit',
    title: 'In‑Store Product Availability Audit',
    duration: '15 min',
    pointsAwarded: 2_250,
    dueIn: '3 days',
  },
];

