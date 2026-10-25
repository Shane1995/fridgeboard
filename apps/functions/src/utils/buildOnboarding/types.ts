export type OnboardingInput = {
  username: string | null;
  canCreateHousehold: boolean;
  isAdmin: boolean;
  hasHousehold: boolean;
  skippedSections: readonly string[];
};
