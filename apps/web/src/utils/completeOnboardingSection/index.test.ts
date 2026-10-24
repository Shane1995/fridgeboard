import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { completeOnboardingSection } from '.';

const onboarding: IOnboardingResponse = {
  sections: [
    { id: 'username', done: false },
    { id: 'household', done: false },
  ],
};

describe('completeOnboardingSection', () => {
  it('marks only the named section done', () => {
    expect(completeOnboardingSection(onboarding, OnboardingSectionId.Username).sections).toEqual([
      { id: 'username', done: true },
      { id: 'household', done: false },
    ]);
  });

  it('does not change the input', () => {
    completeOnboardingSection(onboarding, OnboardingSectionId.Username);

    expect(onboarding.sections[0]?.done).toBe(false);
  });
});
