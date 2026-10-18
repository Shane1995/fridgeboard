import { act, renderHook } from '@testing-library/react';
import { updateSession } from '../../services/session/updateSession';
import { useSession } from './index';

describe('useSession', () => {
  it('reports the current session status and follows updates', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current).toEqual({ status: 'loading' });

    act(() => updateSession({ status: 'signed-in' }));
    expect(result.current).toEqual({ status: 'signed-in' });

    act(() => updateSession({ status: 'signed-out' }));
    expect(result.current).toEqual({ status: 'signed-out' });
  });
});
