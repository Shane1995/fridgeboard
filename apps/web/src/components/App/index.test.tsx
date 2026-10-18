import { render, screen } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { refreshSession } from '../../services/session/refreshSession';
import { SIGN_IN_COPY } from '../../pages/SignIn/constants';
import { App } from '.';

vi.mock('../../services/session/getSessionStatus', () => ({ getSessionStatus: vi.fn() }));
vi.mock('../../services/session/refreshSession', () => ({ refreshSession: vi.fn() }));

describe('App', () => {
  it('sends a signed-out visitor to the sign-in screen', async () => {
    vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedOut);
    vi.mocked(refreshSession).mockResolvedValue(false);
    render(<App />);
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
  });
});
