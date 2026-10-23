import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { QueryName } from '@fridgeboard/contract/configuration/queries/constants';
import { QueryClient } from '@tanstack/react-query';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { applyQuerySettings } from './index';

const retriesOf = (retry: unknown): number =>
  typeof retry === 'function'
    ? Array.from({ length: 10 }, (_, attempt) => attempt).filter((attempt) =>
        retry(attempt, new TypeError('offline')),
      ).length
    : Number(retry);

const configure = (patch: {
  queries?: Partial<typeof TEST_WEB_CONFIGURATION.queries>;
  mutations?: Partial<typeof TEST_WEB_CONFIGURATION.mutations>;
}) => {
  const client = new QueryClient();
  applyQuerySettings(client, {
    queries: { ...TEST_WEB_CONFIGURATION.queries, ...patch.queries },
    mutations: { ...TEST_WEB_CONFIGURATION.mutations, ...patch.mutations },
  });
  return client;
};

describe('applyQuerySettings', () => {
  it('applies the default query entry to an unnamed query', () => {
    const client = configure({});

    const options = client.defaultQueryOptions({ queryKey: ['unnamed'] });
    expect(retriesOf(options.retry)).toBe(1);
    expect(options.staleTime).toBe(30_000);
    expect(options.gcTime).toBe(300_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it('applies the default mutation entry to an unnamed mutation', () => {
    const client = configure({
      mutations: { default: { retry: 2, timeoutMs: 10_000 } },
    });

    const cache = client.getMutationCache();
    expect(cache.build(client, { mutationKey: ['unnamed'] }).options.retry).toBe(2);
  });

  it.each([MutationName.startSignIn, MutationName.verifyCode])(
    'keeps %s non-retryable despite the default mutation entry',
    (name) => {
      const client = configure({ mutations: { default: { retry: 2, timeoutMs: 10_000 } } });

      expect(client.getMutationDefaults([name])).toEqual({ retry: 0 });
      const cache = client.getMutationCache();
      expect(cache.build(client, { mutationKey: [name] }).options.retry).toBe(0);
      expect(cache.build(client, { mutationKey: [MutationName.signOut] }).options.retry).toBe(2);
    },
  );

  it('lets a named query entry override the default entry', () => {
    const client = configure({ queries: { me: { retry: 4, staleTimeMs: 5_000 } } });

    expect(client.getQueryDefaults([QueryName.me])).toEqual({
      retry: expect.any(Function),
      staleTime: 5_000,
    });
    expect(retriesOf(client.defaultQueryOptions({ queryKey: ['other'] }).retry)).toBe(1);
    expect(retriesOf(client.defaultQueryOptions({ queryKey: [QueryName.me] }).retry)).toBe(4);
  });

  it('applies named mutation entries', () => {
    const client = configure({ mutations: { signOut: { retry: 1 } } });

    expect(client.getMutationDefaults([MutationName.signOut])).toEqual({ retry: 1 });
    expect(client.getMutationDefaults([MutationName.verifyCode])).toEqual({ retry: 0 });
  });

  it('lets call-site options win over named query defaults', () => {
    const client = configure({ queries: { me: { staleTimeMs: 5_000 } } });

    expect(client.defaultQueryOptions({ queryKey: [QueryName.me], staleTime: 1 }).staleTime).toBe(
      1,
    );
    expect(client.defaultQueryOptions({ queryKey: [QueryName.me] }).staleTime).toBe(5_000);
  });

  it('clears named entries that a later configuration drops', () => {
    const client = configure({
      queries: { me: { retry: 4 } },
      mutations: { signOut: { retry: 1 } },
    });

    applyQuerySettings(client, TEST_WEB_CONFIGURATION);

    expect(retriesOf(client.defaultQueryOptions({ queryKey: [QueryName.me] }).retry)).toBe(1);
    expect(client.getMutationDefaults([MutationName.signOut])).toEqual({});
  });
});
