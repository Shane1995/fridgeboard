import { Onboarding } from '../../pages/Onboarding';
import { Route } from './onboarding';

describe('authenticated onboarding route', () => {
  it('renders the Onboarding page', () => {
    expect(Route.options.component).toBe(Onboarding);
  });
});
