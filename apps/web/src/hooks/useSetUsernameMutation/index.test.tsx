import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { endpoint } from '../../testUtils/endpoint';
import { useSetUsernameMutation } from './index';

const ME: IMeResponse = {
  sub: 's',
  email: 'a@x.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  hasOnboarding: true,
};

const setup = (response: Response) => {
  const client = new QueryClient();
  client.setQueryData(['me'], ME);
  client.setQueryData(['onboarding'], { sections: [{ id: 'username' }, { id: 'household' }] });
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockResolvedValue(response);
  const { result } = renderHook(() => useSetUsernameMutation(), {
    wrapper: createSessionWrapper(session, client),
  });
  return { result, client, apiFetch };
};

describe('useSetUsernameMutation', () => {
  it('PUTs the username, stores it on /me and completes the username section', async () => {
    const { result, client, apiFetch } = setup(
      new Response(JSON.stringify({ username: 'jess' }), { status: 200 }),
    );

    await act(async () => {
      await result.current.mutateAsync('jess');
    });

    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me/username'), {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
    expect(client.getQueryData<IMeResponse>(['me'])).toMatchObject({
      username: 'jess',
      hasOnboarding: true,
    });
    expect(client.getQueryData(['onboarding'])).toEqual({ sections: [{ id: 'household' }] });
  });

  it('returns the failure reason and leaves the caches alone', async () => {
    const { result, client } = setup(
      new Response(JSON.stringify({ reason: 'username-taken' }), { status: 409 }),
    );

    await act(async () => {
      await expect(result.current.mutateAsync('jess')).resolves.toEqual({
        ok: false,
        reason: 'username-taken',
      });
    });

    expect(client.getQueryData<IMeResponse>(['me'])?.username).toBeNull();
    expect(client.getQueryData(['onboarding'])).toEqual({
      sections: [{ id: 'username' }, { id: 'household' }],
    });
  });
});
