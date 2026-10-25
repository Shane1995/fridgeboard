import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { completeOnboardingSection } from '.';

const onboarding: IOnboardingResponse = {
  sections: [
    { id: 'username', skippable: false },
    { id: 'household', skippable: true },
  ],
};

describe('completeOnboardingSection', () => {
  it('removes only the named section', () => {
    expect(completeOnboardingSection(onboarding, OnboardingSectionId.Username).sections).toEqual([
      { id: 'household', skippable: true },
    ]);
  });

  it('leaves no sections once the last one is done', () => {
    const last: IOnboardingResponse = { sections: [{ id: 'household', skippable: true }] };

    expect(completeOnboardingSection(last, OnboardingSectionId.Household).sections).toEqual([]);
  });

  it('does not change the input', () => {
    completeOnboardingSection(onboarding, OnboardingSectionId.Username);

    expect(onboarding.sections).toHaveLength(2);
  });
});
