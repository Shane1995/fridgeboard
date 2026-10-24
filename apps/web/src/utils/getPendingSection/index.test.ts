import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { getPendingSection } from '.';

const onboarding = (sections: IOnboardingResponse['sections']): IOnboardingResponse => ({
  sections,
});

describe('getPendingSection', () => {
  it('returns the first section', () => {
    expect(getPendingSection(onboarding([{ id: 'username' }, { id: 'household' }]))).toBe(
      OnboardingSectionId.Username,
    );
  });

  it('returns undefined when nothing is pending', () => {
    expect(getPendingSection(onboarding([]))).toBeUndefined();
  });

  it('skips a section id this build does not know', () => {
    const unknown = JSON.parse('{"id":"notifications"}');

    expect(getPendingSection(onboarding([unknown, { id: 'household' }]))).toBe(
      OnboardingSectionId.Household,
    );
  });
});
