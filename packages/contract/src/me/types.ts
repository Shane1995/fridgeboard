export type OnboardingSectionId = 'username' | 'household' | 'needs-invite';

export type IOnboardingSection = { id: OnboardingSectionId; done: boolean };

export type IMeResponse = {
  sub: string;
  email: string;
  username: string | null;
  isAdmin: boolean;
  canCreateHousehold: boolean;
  households: { id: string; name: string; role: string }[];
  onboarding: IOnboardingSection[];
};
