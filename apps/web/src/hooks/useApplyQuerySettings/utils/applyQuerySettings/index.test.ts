import { QueryClient } from '@tanstack/react-query';
import { applyQuerySettings } from './index';

describe('applyQuerySettings', () => {
  it('leaves the client untouched when there are no entries', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

    applyQuerySettings(client, { queries: {}, mutations: {} });

    expect(client.getDefaultOptions()).toEqual({ queries: { retry: 1 } });
    expect(client.getQueryDefaults(['me'])).toEqual({});
  });

  it('merges the default query entry over the built-in defaults', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
    });

    applyQuerySettings(client, { queries: { default: { retry: 3 } }, mutations: {} });

    expect(client.getDefaultOptions().queries).toEqual({ retry: 3, staleTime: 30_000 });
    expect(client.getDefaultOptions().mutations).toBeUndefined();
  });

  it('applies the default mutation entry without touching query defaults', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

    applyQuerySettings(client, { queries: {}, mutations: { default: { retry: 2 } } });

    expect(client.getDefaultOptions()).toEqual({ queries: { retry: 1 }, mutations: { retry: 2 } });
  });

  it('applies per-query entries over the default entry', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

    applyQuerySettings(client, {
      queries: { default: { retry: 2 }, me: { retry: 4, staleTimeMs: 5_000 } },
      mutations: {},
    });

    expect(client.getQueryDefaults(['me'])).toEqual({ retry: 4, staleTime: 5_000 });
    expect(client.defaultQueryOptions({ queryKey: ['other'] }).retry).toBe(2);
    expect(client.defaultQueryOptions({ queryKey: ['me'] }).retry).toBe(4);
  });

  it('applies per-mutation entries', () => {
    const client = new QueryClient();

    applyQuerySettings(client, { queries: {}, mutations: { signOut: { retry: 3 } } });

    expect(client.getMutationDefaults(['signOut'])).toEqual({ retry: 3 });
    expect(client.getMutationDefaults(['verifyCode'])).toEqual({});
  });

  it('lets call-site options win over per-query defaults', () => {
    const client = new QueryClient();
    applyQuerySettings(client, { queries: { me: { staleTimeMs: 5_000 } }, mutations: {} });

    expect(client.defaultQueryOptions({ queryKey: ['me'], staleTime: 1 }).staleTime).toBe(1);
    expect(client.defaultQueryOptions({ queryKey: ['me'] }).staleTime).toBe(5_000);
  });
});
