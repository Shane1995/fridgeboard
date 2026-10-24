export type OnboardingSectionId = 'username' | 'household' | 'needs-invite';

export type IOnboardingSection = { id: OnboardingSectionId };

export type IOnboardingResponse = { sections: IOnboardingSection[] };
