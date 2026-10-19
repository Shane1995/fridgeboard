import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getConfiguration } from '../../services/configuration';
import { useApplyQuerySettings } from './index';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  renderHook(() => useApplyQuerySettings(client), { wrapper });
  return client;
};

describe('useApplyQuerySettings', () => {
  it('applies the entries once the configuration arrives', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...DEFAULT_WEB_CONFIGURATION,
      queries: { default: { retry: 4 }, me: { staleTimeMs: 7_000 } },
      mutations: { signOut: { retry: 0 } },
    });
    const client = setup();

    await waitFor(() => expect(client.getQueryDefaults(['me']).staleTime).toBe(7_000));
    expect(client.getDefaultOptions().queries?.retry).toBe(4);
    expect(client.getMutationDefaults(['signOut'])).toEqual({ retry: 0 });
  });

  it('keeps the built-in defaults while the configuration is pending', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    const client = setup();

    expect(client.getDefaultOptions()).toEqual({ queries: { retry: 1 } });
  });
});
