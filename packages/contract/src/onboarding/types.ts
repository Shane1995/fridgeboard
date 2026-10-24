export type OnboardingSectionId = 'username' | 'household' | 'needs-invite';

export type IOnboardingSection = { id: OnboardingSectionId; done: boolean };

export type IOnboardingResponse = { sections: IOnboardingSection[] };
