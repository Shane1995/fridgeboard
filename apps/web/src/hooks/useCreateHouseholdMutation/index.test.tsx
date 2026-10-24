import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { endpoint } from '../../testUtils/endpoint';
import { useCreateHouseholdMutation } from './index';

const ME: IMeResponse = {
  sub: 's',
  email: 'a@x.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: true,
  hasOnboarding: true,
};

const setup = (response: Response) => {
  const client = new QueryClient();
  client.setQueryData(['me'], ME);
  client.setQueryData(['onboarding'], { sections: [{ id: 'household' }] });
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockResolvedValue(response);
  const { result } = renderHook(() => useCreateHouseholdMutation(), {
    wrapper: createSessionWrapper(session, client),
  });
  return { result, client, apiFetch };
};

describe('useCreateHouseholdMutation', () => {
  it('POSTs the name, completes the household section and clears hasOnboarding', async () => {
    const { result, client, apiFetch } = setup(
      new Response(JSON.stringify({ id: 'hh-1', name: 'Home', role: 'owner' }), { status: 201 }),
    );

    await act(async () => {
      await result.current.mutateAsync('Home');
    });

    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/households'), {
      method: 'POST',
      body: JSON.stringify({ name: 'Home' }),
    });
    expect(client.getQueryData(['onboarding'])).toEqual({ sections: [] });
    expect(client.getQueryData<IMeResponse>(['me'])?.hasOnboarding).toBe(false);
  });

  it('returns the failure reason and keeps the section pending', async () => {
    const { result, client } = setup(
      new Response(JSON.stringify({ reason: 'not-allowed' }), { status: 403 }),
    );

    await act(async () => {
      await expect(result.current.mutateAsync('Home')).resolves.toEqual({
        ok: false,
        reason: 'not-allowed',
      });
    });

    expect(client.getQueryData(['onboarding'])).toEqual({ sections: [{ id: 'household' }] });
  });
});
