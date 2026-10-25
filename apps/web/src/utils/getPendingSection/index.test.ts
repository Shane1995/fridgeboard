import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { getPendingSection } from '.';

const onboarding = (sections: IOnboardingResponse['sections']): IOnboardingResponse => ({
  sections,
});

describe('getPendingSection', () => {
  it('returns the first section', () => {
    expect(
      getPendingSection(
        onboarding([
          { id: 'username', skippable: false },
          { id: 'household', skippable: true },
        ]),
      ),
    ).toBe(OnboardingSectionId.Username);
  });

  it('returns undefined when nothing is pending', () => {
    expect(getPendingSection(onboarding([]))).toBeUndefined();
  });

  it('skips a section id this build does not know', () => {
    const unknown = JSON.parse('{"id":"notifications"}');

    expect(getPendingSection(onboarding([unknown, { id: 'household', skippable: true }]))).toBe(
      OnboardingSectionId.Household,
    );
  });
});
