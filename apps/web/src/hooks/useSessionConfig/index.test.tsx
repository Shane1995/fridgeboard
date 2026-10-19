import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { useSessionConfig } from '.';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
    {children}
  </RemoteConfigContext.Provider>
);

describe('useSessionConfig', () => {
  it('derives the session config from the remote configuration', () => {
    const { result } = renderHook(() => useSessionConfig(), { wrapper });

    expect(result.current).toEqual({
      refreshPath: '/api/v1/auth/refresh',
      refreshLeadMs: 60_000,
      refreshMinIntervalMs: 60_000,
    });
  });

  it('keeps the same object across rerenders', () => {
    const { result, rerender } = renderHook(() => useSessionConfig(), { wrapper });
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
