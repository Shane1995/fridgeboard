import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { watchSession } from '../../services/session/watchSession';
import { useWatchSession } from '.';

vi.mock('../../services/session/watchSession', () => ({ watchSession: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
    {children}
  </RemoteConfigContext.Provider>
);

describe('useWatchSession', () => {
  it('watches the session with the configured settings and stops on unmount', () => {
    const stop = vi.fn();
    vi.mocked(watchSession).mockReturnValue(stop);

    const { unmount } = renderHook(() => useWatchSession(), { wrapper });

    expect(watchSession).toHaveBeenCalledWith({
      refreshPath: '/api/v1/auth/refresh',
      refreshLeadMs: 60_000,
      refreshMinIntervalMs: 60_000,
    });
    expect(stop).not.toHaveBeenCalled();
    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
