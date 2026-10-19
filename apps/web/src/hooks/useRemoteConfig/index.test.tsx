import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { MISSING_PROVIDER_MESSAGE } from './constants';
import { useRemoteConfig } from './index';

describe('useRemoteConfig', () => {
  it('returns the configuration from the provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
        {children}
      </RemoteConfigContext.Provider>
    );

    const { result } = renderHook(() => useRemoteConfig(), { wrapper });

    expect(result.current).toBe(DEFAULT_WEB_CONFIGURATION);
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useRemoteConfig())).toThrow(MISSING_PROVIDER_MESSAGE);
  });
});
