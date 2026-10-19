import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getConfiguration } from '../../services/configuration';
import { useFeatureFlag } from './index';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useFeatureFlag', () => {
  it('returns the default while the configuration loads', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFeatureFlag(WebFeatureFlag.ENABLE_ADMIN_INVITES), {
      wrapper,
    });

    expect(result.current).toBe(false);
  });

  it('returns the served value once loaded', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...DEFAULT_WEB_CONFIGURATION,
      featureFlags: { [WebFeatureFlag.ENABLE_ADMIN_INVITES]: true },
    });
    const { result } = renderHook(() => useFeatureFlag(WebFeatureFlag.ENABLE_ADMIN_INVITES), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});
