import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { MutationName } from '../../services/configuration/schema/constants';
import { WebService } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { endpoint } from '../../testUtils/endpoint';
import { useApiMutation } from './index';

const REASONS = ['taken'] as const;

const setup = (response: Response) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockResolvedValue(response);
  const onSuccess = vi.fn();
  const client = new QueryClient();
  const { result } = renderHook(
    () =>
      useApiMutation({
        name: MutationName.setUsername,
        service: WebService.username,
        method: 'PUT',
        toBody: (username: string) => ({ username }),
        reasons: REASONS,
        onSuccess,
      }),
    { wrapper: createSessionWrapper(session, client) },
  );
  return { result, apiFetch, onSuccess, client };
};

describe('useApiMutation', () => {
  it('sends the body to the configured URL and hands the response to onSuccess', async () => {
    const { result, apiFetch, onSuccess } = setup(
      new Response(JSON.stringify({ username: 'jess' }), { status: 200 }),
    );

    await act(async () => {
      await expect(result.current.mutateAsync('jess')).resolves.toEqual({
        ok: true,
        data: { username: 'jess' },
      });
    });

    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me/username'), {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
    expect(onSuccess).toHaveBeenCalledWith({ username: 'jess' });
  });

  it('returns a known failure reason without calling onSuccess', async () => {
    const { result, onSuccess } = setup(
      new Response(JSON.stringify({ reason: 'taken' }), { status: 409 }),
    );

    await act(async () => {
      await expect(result.current.mutateAsync('jess')).resolves.toEqual({
        ok: false,
        reason: 'taken',
      });
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('registers under its mutation name', async () => {
    const { result, client } = setup(new Response('{}', { status: 200 }));

    await act(async () => {
      await result.current.mutateAsync('jess');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual([
      MutationName.setUsername,
    ]);
  });
});
