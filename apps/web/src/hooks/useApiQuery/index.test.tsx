import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { WebService } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { endpoint } from '../../testUtils/endpoint';
import { useApiQuery } from './index';

const BODY = { sub: 'sub-1' };

const render = (status: SessionStatus, enabled?: boolean) => {
  const client = new QueryClient();
  const { session, apiFetch } = createSession(status);
  apiFetch.mockResolvedValue(new Response(JSON.stringify(BODY), { status: 200 }));
  const hook = renderHook(
    () =>
      useApiQuery({
        name: 'thing',
        service: WebService.me,
        ...(enabled === undefined ? {} : { enabled }),
      }),
    { wrapper: createSessionWrapper(session, client) },
  );
  return { ...hook, client, apiFetch };
};

describe('useApiQuery', () => {
  it('fetches the configured URL of the service and caches it under the name', async () => {
    const { result, client, apiFetch } = render(SessionStatus.SignedIn);

    await waitFor(() => expect(result.current.data).toEqual(BODY));
    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me'));
    expect(client.getQueryData(['thing'])).toEqual(BODY);
  });

  it.each([SessionStatus.Loading, SessionStatus.SignedOut])(
    'does not fetch while the session is %s',
    async (status) => {
      const { apiFetch } = render(status);

      await Promise.resolve();

      expect(apiFetch).not.toHaveBeenCalled();
    },
  );

  it('does not fetch when disabled by the caller', async () => {
    const { apiFetch } = render(SessionStatus.SignedIn, false);

    await Promise.resolve();

    expect(apiFetch).not.toHaveBeenCalled();
  });
});
