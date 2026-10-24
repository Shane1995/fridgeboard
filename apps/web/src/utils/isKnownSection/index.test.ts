import { OnboardingSectionId } from '../../services/onboarding/constants';
import { isKnownSection } from './index';

describe('isKnownSection', () => {
  it.each(Object.values(OnboardingSectionId))('knows %s', (id) => {
    expect(isKnownSection(id)).toBe(true);
  });

  it.each(['', 'notifications', 'USERNAME'])('does not know %s', (id) => {
    expect(isKnownSection(id)).toBe(false);
  });
});
