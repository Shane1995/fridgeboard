import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { MISSING_PROVIDER_MESSAGE } from './constants';
import { useSessionContext } from './index';

const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn: vi.fn(),
  verifyCode: vi.fn(),
  signOut: vi.fn(),
  refresh: vi.fn(),
  apiFetch: vi.fn(),
};

describe('useSessionContext', () => {
  it('returns the session from the provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });

    expect(result.current).toBe(session);
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSessionContext())).toThrow(MISSING_PROVIDER_MESSAGE);
  });
});
