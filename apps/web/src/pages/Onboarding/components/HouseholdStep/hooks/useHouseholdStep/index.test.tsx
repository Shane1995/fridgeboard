import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { endpoint } from '../../../../../../testUtils/endpoint';
import { json } from '../../../../../../testUtils/json';
import { submitEvent } from '../../../../../../testUtils/submitEvent';
import { ONBOARDING_COPY } from '../../../../constants';
import { useHouseholdStep } from './index';

const setup = () => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  const { result } = renderHook(() => useHouseholdStep(), {
    wrapper: createProvidersWrapper(session),
  });
  return { result, apiFetch };
};

describe('useHouseholdStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('suggests the default household name', () => {
    expect(setup().result.current.name).toBe('Home');
  });

  it('creates the household with the trimmed name', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockResolvedValue(json(201, { id: 'hh-1', name: 'Our home', role: 'owner' }));

    act(() => result.current.setName(' Our home '));
    await act(async () => result.current.handleSubmit(submitEvent));

    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/households'), {
      method: 'POST',
      body: JSON.stringify({ name: 'Our home' }),
    });
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('shows the message when the server refuses', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockResolvedValue(json(403, { reason: 'not-allowed' }));

    await act(async () => result.current.handleSubmit(submitEvent));

    expect(result.current.errorMessage).toBe(ONBOARDING_COPY.household.reasons['not-allowed']);
  });

  it('shows the generic message when the request throws', async () => {
    const { result, apiFetch } = setup();
    apiFetch.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleSubmit(submitEvent));

    expect(result.current.errorMessage).toBe(ONBOARDING_COPY.household.reasons.unknown);
  });
});
