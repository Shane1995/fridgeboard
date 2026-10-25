import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '../../Context/Toast';
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
    expect(onSuccess).toHaveBeenCalledWith({ username: 'jess' }, 'jess');
  });

  it('works without an onSuccess handler', async () => {
    const { session, apiFetch } = createSession(SessionStatus.SignedIn);
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ username: 'jess' }), { status: 200 }));
    const { result } = renderHook(
      () =>
        useApiMutation({
          name: MutationName.setUsername,
          service: WebService.username,
          method: 'PUT',
          toBody: (username: string) => ({ username }),
          reasons: REASONS,
        }),
      { wrapper: createSessionWrapper(session, new QueryClient()) },
    );

    await act(async () => {
      await expect(result.current.mutateAsync('jess')).resolves.toEqual({
        ok: true,
        data: { username: 'jess' },
      });
    });
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

  describe('params and optimistic changes', () => {
    const KEY = ['items', { householdId: 'hh-1', listId: 'main' }];

    const setupList = (response: Response | Promise<Response>) => {
      const { session, apiFetch } = createSession(SessionStatus.SignedIn);
      apiFetch.mockImplementation(async () => response);
      const client = new QueryClient();
      client.setQueryData(KEY, { items: ['a', 'b'] });
      const { result } = renderHook(
        () =>
          useApiMutation({
            name: MutationName.deleteItem,
            service: WebService.listItem,
            method: 'DELETE',
            toBody: () => undefined,
            toParams: (id: string) => ({ householdId: 'hh-1', listId: 'main', itemId: id }),
            reasons: [] as const,
            onSuccess: vi.fn(),
            optimistic: {
              queryKey: KEY,
              update: ({
                current,
                variables,
              }: {
                current: { items: string[] };
                variables: string;
              }) => ({ items: current.items.filter((item) => item !== variables) }),
            },
          }),
        { wrapper: createSessionWrapper(session, client) },
      );
      return { result, apiFetch, client };
    };

    it('fills the path parameters from the variables and keeps the optimistic change', async () => {
      const { result, apiFetch, client } = setupList(new Response(null, { status: 204 }));

      await act(async () => {
        await result.current.mutateAsync('a');
      });

      expect(apiFetch).toHaveBeenCalledWith(
        endpoint('/api/v1/households/hh-1/lists/main/items/a'),
        { method: 'DELETE', body: undefined },
      );
      expect(client.getQueryData(KEY)).toEqual({ items: ['b'] });
    });

    it('shows the change while the request is out', async () => {
      let answer: (response: Response) => void = () => undefined;
      const { result, client } = setupList(new Promise((resolve) => (answer = resolve)));

      act(() => {
        result.current.mutate('a');
      });

      await waitFor(() => expect(client.getQueryData(KEY)).toEqual({ items: ['b'] }));
      await act(async () => answer(new Response(null, { status: 204 })));
    });

    it('puts the old data back when the answer is a failure', async () => {
      const { result, client } = setupList(
        new Response(JSON.stringify({ reason: 'not-found' }), { status: 404 }),
      );

      await act(async () => {
        await result.current.mutateAsync('a');
      });

      expect(client.getQueryData(KEY)).toEqual({ items: ['a', 'b'] });
    });

    it('puts the old data back when the request throws', async () => {
      const { session, apiFetch } = createSession(SessionStatus.SignedIn);
      apiFetch.mockRejectedValue(new Error('offline'));
      const client = new QueryClient();
      client.setQueryData(KEY, { items: ['a'] });
      const { result } = renderHook(
        () =>
          useApiMutation({
            name: MutationName.deleteItem,
            service: WebService.listItem,
            method: 'DELETE',
            toBody: () => undefined,
            toParams: () => ({ householdId: 'hh-1', listId: 'main', itemId: 'a' }),
            reasons: [] as const,
            onSuccess: vi.fn(),
            optimistic: {
              queryKey: KEY,
              update: () => ({ items: [] }),
            },
          }),
        { wrapper: createSessionWrapper(session, client) },
      );

      await act(async () => {
        await result.current.mutateAsync('a').catch(() => undefined);
      });

      expect(client.getQueryData(KEY)).toEqual({ items: ['a'] });
    });
  });
});

describe('useApiMutation failure message', () => {
  const FAILED = 'Could not save the username.';

  const setUp = (
    { failureMessage }: { failureMessage?: string },
    answer: () => Promise<Response>,
  ) => {
    const { session, apiFetch } = createSession(SessionStatus.SignedIn);
    apiFetch.mockImplementation(answer);
    const Base = createSessionWrapper(session, new QueryClient());
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Base>
        <ToastProvider>{children}</ToastProvider>
      </Base>
    );
    const { result } = renderHook(
      () =>
        useApiMutation({
          name: MutationName.setUsername,
          service: WebService.username,
          method: 'PUT',
          toBody: (username: string) => ({ username }),
          reasons: REASONS,
          ...(failureMessage === undefined ? {} : { failureMessage }),
        }),
      { wrapper },
    );
    return result;
  };

  it('shows it when the server answers with a failure', async () => {
    const result = setUp(
      { failureMessage: FAILED },
      async () => new Response('{}', { status: 409 }),
    );

    await act(async () => {
      await result.current.mutateAsync('jess');
    });

    expect(await screen.findByText(FAILED)).toBeInTheDocument();
  });

  it('shows it when the request itself throws', async () => {
    const result = setUp({ failureMessage: FAILED }, () => Promise.reject(new Error('offline')));

    await act(async () => {
      await result.current.mutateAsync('jess').catch(() => undefined);
    });

    expect(await screen.findByText(FAILED)).toBeInTheDocument();
  });

  it('shows nothing when the request works', async () => {
    const result = setUp(
      { failureMessage: FAILED },
      async () => new Response(JSON.stringify({ username: 'jess' }), { status: 200 }),
    );

    await act(async () => {
      await result.current.mutateAsync('jess');
    });

    expect(screen.queryByText(FAILED)).not.toBeInTheDocument();
  });

  it('shows nothing when no message was given', async () => {
    const result = setUp({}, async () => new Response('{}', { status: 409 }));

    await act(async () => {
      await result.current.mutateAsync('jess');
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
