import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { QueryName } from '@fridgeboard/contract/configuration/queries/constants';
import { QueryClient } from '@tanstack/react-query';
import { applyQuerySettings } from './index';

const BASELINE = { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: true } };

const setup = () => new QueryClient({ defaultOptions: BASELINE });

describe('applyQuerySettings', () => {
  it('keeps the built-in baseline when there are no entries', () => {
    const client = setup();

    applyQuerySettings(client, { queries: {}, mutations: {} }, BASELINE);

    expect(client.getDefaultOptions().queries).toEqual(BASELINE.queries);
    expect(client.getDefaultOptions().mutations).toEqual({});
    expect(client.getQueryDefaults([QueryName.me])).toEqual({});
    expect(client.getMutationDefaults([MutationName.signOut])).toEqual({});
  });

  it('applies the default query entry to an unnamed query', () => {
    const client = setup();

    applyQuerySettings(client, { queries: { default: { retry: 3 } }, mutations: {} }, BASELINE);

    const options = client.defaultQueryOptions({ queryKey: ['unnamed'] });
    expect(options.retry).toBe(3);
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it('applies the default mutation entry to an unnamed mutation', () => {
    const client = setup();

    applyQuerySettings(client, { queries: {}, mutations: { default: { retry: 2 } } }, BASELINE);

    const cache = client.getMutationCache();
    expect(cache.build(client, { mutationKey: ['unnamed'] }).options.retry).toBe(2);
    expect(client.getDefaultOptions().queries).toEqual(BASELINE.queries);
  });

  it.each([MutationName.startSignIn, MutationName.verifyCode])(
    'keeps %s non-retryable despite the default mutation entry',
    (name) => {
      const client = setup();

      applyQuerySettings(client, { queries: {}, mutations: { default: { retry: 2 } } }, BASELINE);

      expect(client.getMutationDefaults([name])).toEqual({ retry: 0 });
      const cache = client.getMutationCache();
      expect(cache.build(client, { mutationKey: [name] }).options.retry).toBe(0);
      expect(cache.build(client, { mutationKey: [MutationName.signOut] }).options.retry).toBe(2);
    },
  );

  it('lets a named query entry override the default entry', () => {
    const client = setup();

    applyQuerySettings(
      client,
      {
        queries: { default: { retry: 2 }, me: { retry: 4, staleTimeMs: 5_000 } },
        mutations: {},
      },
      BASELINE,
    );

    expect(client.getQueryDefaults([QueryName.me])).toEqual({ retry: 4, staleTime: 5_000 });
    expect(client.defaultQueryOptions({ queryKey: ['other'] }).retry).toBe(2);
    expect(client.defaultQueryOptions({ queryKey: [QueryName.me] }).retry).toBe(4);
  });

  it('applies named mutation entries', () => {
    const client = setup();

    applyQuerySettings(client, { queries: {}, mutations: { signOut: { retry: 3 } } }, BASELINE);

    expect(client.getMutationDefaults([MutationName.signOut])).toEqual({ retry: 3 });
    expect(client.getMutationDefaults([MutationName.verifyCode])).toEqual({ retry: 0 });
  });

  it('lets call-site options win over named query defaults', () => {
    const client = setup();
    applyQuerySettings(
      client,
      { queries: { me: { staleTimeMs: 5_000 } }, mutations: {} },
      BASELINE,
    );

    expect(client.defaultQueryOptions({ queryKey: [QueryName.me], staleTime: 1 }).staleTime).toBe(
      1,
    );
    expect(client.defaultQueryOptions({ queryKey: [QueryName.me] }).staleTime).toBe(5_000);
  });

  it('reverts removed entries to the baseline on the next application', () => {
    const client = setup();
    applyQuerySettings(
      client,
      {
        queries: { default: { retry: 5, staleTimeMs: 1_000 }, me: { retry: 4 } },
        mutations: { default: { retry: 2 }, signOut: { retry: 3 } },
      },
      BASELINE,
    );

    applyQuerySettings(client, { queries: {}, mutations: {} }, BASELINE);

    expect(client.defaultQueryOptions({ queryKey: ['unnamed'] }).retry).toBe(1);
    expect(client.defaultQueryOptions({ queryKey: ['unnamed'] }).staleTime).toBe(30_000);
    expect(client.defaultQueryOptions({ queryKey: [QueryName.me] }).retry).toBe(1);
    expect(client.getDefaultOptions().mutations).toEqual({});
    expect(client.getMutationDefaults([MutationName.signOut])).toEqual({});
  });
});
