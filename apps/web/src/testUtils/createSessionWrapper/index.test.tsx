import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useSessionContext } from '../../hooks/useSessionContext';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../createSession';
import { createSessionWrapper } from '.';

describe('createSessionWrapper', () => {
  it('provides the given session under a query client', () => {
    const { session } = createSession(SessionStatus.SignedOut);

    const { result } = renderHook(() => useSessionContext(), {
      wrapper: createSessionWrapper(session, new QueryClient()),
    });

    expect(result.current).toBe(session);
  });
});
