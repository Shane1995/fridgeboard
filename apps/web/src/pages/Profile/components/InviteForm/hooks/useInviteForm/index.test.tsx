import { act, renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { endpoint } from '../../../../../../testUtils/endpoint';
import { json } from '../../../../../../testUtils/json';
import { submitEvent } from '../../../../../../testUtils/submitEvent';
import { INVITE_COPY } from '../../constants';
import { useInviteForm } from './index';

const setup = (inviteResponse: () => Response | Promise<Response>) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockImplementation(async ({ path }: { path: string }) =>
    path.endsWith('/invites')
      ? inviteResponse()
      : json(200, { households: [{ id: 'h1', name: 'Home', role: 'owner' }] }),
  );
  const { result } = renderHook(() => useInviteForm(), {
    wrapper: createProvidersWrapper(session),
  });
  return { result, apiFetch };
};

const send = async (result: ReturnType<typeof setup>['result'], email: string): Promise<void> => {
  act(() => result.current.setEmail(email));
  await act(async () => result.current.handleSubmit(submitEvent));
};

describe('useInviteForm', () => {
  beforeEach(() => vi.resetAllMocks());

  it('posts the trimmed email to the active household and clears the field', async () => {
    const { result, apiFetch } = setup(() =>
      json(201, { email: 'tash@example.com', verified: true }),
    );
    await waitFor(() => expect(apiFetch).toHaveBeenCalled());

    await send(result, ' tash@example.com ');

    await waitFor(() => expect(result.current.email).toBe(''));
    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/households/h1/invites'), {
      method: 'POST',
      body: JSON.stringify({ email: 'tash@example.com' }),
    });
    expect(result.current.feedback).toEqual({
      kind: 'success',
      message: INVITE_COPY.sent('tash@example.com'),
    });
  });

  it('warns that an unverified address will get a verification email first', async () => {
    const { result } = setup(() => json(201, { email: 'tash@example.com', verified: false }));

    await send(result, 'tash@example.com');

    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        kind: 'success',
        message: INVITE_COPY.sentCheckEmail('tash@example.com'),
      }),
    );
  });

  it.each([
    [400, 'invalid-email'],
    [404, 'not-found'],
    [409, 'limit-reached'],
    [409, 'already-invited'],
    [502, 'verification-failed'],
  ] as const)('shows the %s %s failure and keeps the email', async (status, reason) => {
    const { result } = setup(() => json(status, { reason }));

    await send(result, 'tash@example.com');

    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        kind: 'error',
        message: INVITE_COPY.reasons[reason],
      }),
    );
    expect(result.current.email).toBe('tash@example.com');
  });

  it('shows the generic message for an unexpected failure', async () => {
    const { result } = setup(() => json(500, {}));

    await send(result, 'tash@example.com');

    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        kind: 'error',
        message: INVITE_COPY.reasons.unknown,
      }),
    );
  });
});
