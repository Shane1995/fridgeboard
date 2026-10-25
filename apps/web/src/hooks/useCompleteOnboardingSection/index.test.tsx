import type { IMeResponse } from '@fridgeboard/contract/me';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { useCompleteOnboardingSection } from './index';

const ME: IMeResponse = {
  sub: 's',
  email: 'a@x.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  hasOnboarding: true,
};

const setup = (sections: IOnboardingResponse['sections'], withMe = true) => {
  const client = new QueryClient();
  client.setQueryData(['onboarding'], { sections });
  if (withMe) {
    client.setQueryData(['me'], ME);
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useCompleteOnboardingSection(), { wrapper }) };
};

describe('useCompleteOnboardingSection', () => {
  it('removes the section and keeps hasOnboarding while others remain', () => {
    const { client, result } = setup([
      { id: 'username', skippable: false },
      { id: 'household', skippable: true },
    ]);

    result.current(OnboardingSectionId.Username);

    expect(client.getQueryData(['onboarding'])).toEqual({
      sections: [{ id: 'household', skippable: true }],
    });
    expect(client.getQueryData<IMeResponse>(['me'])?.hasOnboarding).toBe(true);
  });

  it('clears hasOnboarding when the last section is done', () => {
    const { client, result } = setup([{ id: 'household', skippable: true }]);

    result.current(OnboardingSectionId.Household);

    expect(client.getQueryData<IMeResponse>(['me'])?.hasOnboarding).toBe(false);
  });

  it('does nothing when the caches are empty', () => {
    const { client, result } = setup([], false);
    client.removeQueries({ queryKey: ['onboarding'] });

    result.current(OnboardingSectionId.Household);

    expect(client.getQueryData(['me'])).toBeUndefined();
  });
});
