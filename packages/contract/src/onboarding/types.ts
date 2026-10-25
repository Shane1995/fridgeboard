export type OnboardingSectionId = 'username' | 'household' | 'needs-invite';

export type IOnboardingSection = { id: OnboardingSectionId; skippable: boolean };

export type IOnboardingResponse = { sections: IOnboardingSection[] };

export type IOnboardingErrorResponse = { reason: 'not-skippable' };
