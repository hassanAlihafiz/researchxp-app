export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  EmailSignUp: undefined;
  OnboardingLayer0: undefined;
  OnboardingValuePrimer: undefined;
  OnboardingWelcomeReward: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPasswordEmail: undefined;
  ForgotPasswordCode: { email: string };
  ForgotPasswordNew: { email: string; code: string };
  Main: undefined;
  InternalSurvey: { assignmentId: number };
};

export type MainDrawerParamList = {
  Tabs: undefined;
  Settings: undefined;
  Help: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Rewards: undefined;
  Profile: undefined;
};
