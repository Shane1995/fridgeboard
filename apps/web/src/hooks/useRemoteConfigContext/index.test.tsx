import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { MISSING_PROVIDER_MESSAGE } from './constants';
import { useRemoteConfigContext } from './index';

describe('useRemoteConfigContext', () => {
  it('returns the configuration from the provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
        {children}
      </RemoteConfigContext.Provider>
    );

    const { result } = renderHook(() => useRemoteConfigContext(), { wrapper });

    expect(result.current).toBe(DEFAULT_WEB_CONFIGURATION);
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useRemoteConfigContext())).toThrow(MISSING_PROVIDER_MESSAGE);
  });
});
