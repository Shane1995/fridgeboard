import { renderHook } from '@testing-library/react';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { useSessionContext } from '../../hooks/useSessionContext';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../createSession';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';
import { createProvidersWrapper } from './index';

describe('createProvidersWrapper', () => {
  it('provides the session and the test configuration', () => {
    const { session } = createSession(SessionStatus.SignedIn);

    const { result } = renderHook(
      () => ({ session: useSessionContext(), config: useRemoteConfigContext() }),
      { wrapper: createProvidersWrapper(session) },
    );

    expect(result.current.session).toBe(session);
    expect(result.current.config).toBe(TEST_WEB_CONFIGURATION);
  });
});
