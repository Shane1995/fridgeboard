import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { updateSession } from '../../services/session/updateSession';
import { useSession } from './index';

describe('useSession', () => {
  it('reports the current session status and follows updates', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current).toEqual({ status: 'loading' });

    act(() => updateSession({ status: SessionStatus.SignedIn }));
    expect(result.current).toEqual({ status: 'signed-in' });

    act(() => updateSession({ status: SessionStatus.SignedOut }));
    expect(result.current).toEqual({ status: 'signed-out' });
  });
});
