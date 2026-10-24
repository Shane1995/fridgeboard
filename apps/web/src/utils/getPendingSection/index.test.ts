import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { getPendingSection } from '.';

const onboarding = (sections: IOnboardingResponse['sections']): IOnboardingResponse => ({
  sections,
});

describe('getPendingSection', () => {
  it('returns the first section that is not done', () => {
    expect(
      getPendingSection(
        onboarding([
          { id: 'username', done: true },
          { id: 'household', done: false },
        ]),
      ),
    ).toBe(OnboardingSectionId.Household);
  });

  it('returns undefined once every section is done', () => {
    expect(getPendingSection(onboarding([{ id: 'username', done: true }]))).toBeUndefined();
  });

  it('skips a section id this build does not know', () => {
    const unknown = JSON.parse('{"id":"notifications","done":false}');

    expect(getPendingSection(onboarding([unknown, { id: 'username', done: false }]))).toBe(
      OnboardingSectionId.Username,
    );
  });
});
