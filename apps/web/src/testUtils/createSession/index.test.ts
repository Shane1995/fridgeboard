import { SessionStatus } from '../../services/session/constants';
import { createSession } from '.';

describe('createSession', () => {
  it('defaults to a signed-in session wired to its mocks', async () => {
    const { session, apiFetch } = createSession();
    apiFetch.mockResolvedValue('ok');

    expect(session.status).toBe(SessionStatus.SignedIn);
    await expect(session.apiFetch('/x')).resolves.toBe('ok');
  });

  it('takes the status', () => {
    expect(createSession(SessionStatus.SignedOut).session.status).toBe(SessionStatus.SignedOut);
  });
});
