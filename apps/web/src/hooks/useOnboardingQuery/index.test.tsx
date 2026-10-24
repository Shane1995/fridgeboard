import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { endpoint } from '../../testUtils/endpoint';
import { SessionStatus } from '../../services/session/constants';
import { useOnboardingQuery } from './index';

const ONBOARDING = { sections: [{ id: 'username', done: false }] };

describe('useOnboardingQuery', () => {
  it('loads the sections through the session apiFetch under the onboarding key', async () => {
    const client = new QueryClient();
    const { session, apiFetch } = createSession(SessionStatus.SignedIn);
    apiFetch.mockResolvedValue(new Response(JSON.stringify(ONBOARDING), { status: 200 }));

    const { result } = renderHook(() => useOnboardingQuery(), {
      wrapper: createSessionWrapper(session, client),
    });

    await waitFor(() => expect(result.current.data).toEqual(ONBOARDING));
    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me/onboarding'));
    expect(client.getQueryData(['onboarding'])).toEqual(ONBOARDING);
  });
});
