import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { endpoint } from '../../../../../../testUtils/endpoint';
import { json } from '../../../../../../testUtils/json';
import { submitEvent } from '../../../../../../testUtils/submitEvent';
import { TEST_WEB_CONFIGURATION } from '../../../../../../testUtils/webConfiguration';
import { ONBOARDING_COPY } from '../../../../constants';
import { useUsernameStep } from './index';

const setup = () => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  const { result } = renderHook(() => useUsernameStep(), {
    wrapper: createProvidersWrapper(session),
  });
  return { result, apiFetch };
};

describe('useUsernameStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('takes the length limits from the configuration', () => {
    const { result } = setup();

    expect(result.current.minLength).toBe(TEST_WEB_CONFIGURATION.settings.usernameMinLength);
    expect(result.current.maxLength).toBe(TEST_WEB_CONFIGURATION.settings.usernameMaxLength);
  });

  it('saves the trimmed username', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockResolvedValue(json(200, { username: 'jess' }));

    act(() => result.current.setUsername('  jess '));
    await act(async () => result.current.handleSubmit(submitEvent));

    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me/username'), {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('shows the message for a refused username', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockResolvedValue(json(409, { reason: 'username-taken' }));

    await act(async () => result.current.handleSubmit(submitEvent));

    expect(result.current.errorMessage).toBe(ONBOARDING_COPY.username.reasons['username-taken']);
  });

  it('shows the generic message when the request throws', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleSubmit(submitEvent));

    expect(result.current.errorMessage).toBe(ONBOARDING_COPY.username.reasons.unknown);
  });
});
