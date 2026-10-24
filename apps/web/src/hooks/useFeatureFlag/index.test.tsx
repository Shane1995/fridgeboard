import { WebFeatureFlag } from '../../services/configuration/flags/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getConfiguration } from '../../services/configuration';
import { RemoteConfigProvider } from '../../Context/RemoteConfig';
import { useFeatureFlag } from './index';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <RemoteConfigProvider>{children}</RemoteConfigProvider>
  </QueryClientProvider>
);

describe('useFeatureFlag', () => {
  it('renders nothing while the configuration loads', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFeatureFlag(WebFeatureFlag.ENABLE_ADMIN_INVITES), {
      wrapper,
    });

    expect(result.current).toBeNull();
  });

  it('returns the served value once loaded', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...TEST_WEB_CONFIGURATION,
      featureFlags: {
        [WebFeatureFlag.ENABLE_ADMIN_INVITES]: true,
        [WebFeatureFlag.ENABLE_PASSKEYS]: false,
      },
    });
    const { result } = renderHook(() => useFeatureFlag(WebFeatureFlag.ENABLE_ADMIN_INVITES), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});
