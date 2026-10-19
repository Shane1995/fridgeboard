import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { useRouterContext } from '.';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
    {children}
  </RemoteConfigContext.Provider>
);

describe('useRouterContext', () => {
  it('builds the router context from the remote configuration', () => {
    const { result } = renderHook(() => useRouterContext(), { wrapper });

    expect(result.current.mePath).toBe('/api/v1/me');
  });

  it('keeps the same object across rerenders', () => {
    const { result, rerender } = renderHook(() => useRouterContext(), { wrapper });
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
