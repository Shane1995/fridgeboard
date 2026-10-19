import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { RemoteConfigContext } from '../../../../Context/RemoteConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../constants';
import { EmailStep } from './index';
import { SessionContext } from '../../../../Context/Session';
import type { SessionContextValue } from '../../../../Context/Session/types';
import { SessionStatus } from '../../../../services/session/constants';

const startSignIn = vi.fn();
const verifyCode = vi.fn();
const signOut = vi.fn();
const apiFetch = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn,
  verifyCode,
  signOut,
  refresh: vi.fn(),
  apiFetch,
};

const onCodeSent = vi.fn();

const renderStep = (initialEmail?: string) =>
  render(
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={new QueryClient()}>
          <EmailStep initialEmail={initialEmail} onCodeSent={onCodeSent} />
        </QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>,
  );

const submitEmail = (email: string) => {
  fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.emailLabel), { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.sendCode }));
};

describe('EmailStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('uses an email input with email autocomplete', () => {
    renderStep();
    const input = screen.getByLabelText(SIGN_IN_COPY.emailLabel);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('pre-fills the initial email', () => {
    renderStep('a@b.com');
    expect(screen.getByLabelText(SIGN_IN_COPY.emailLabel)).toHaveValue('a@b.com');
  });

  it('hands the email on when the code is sent', async () => {
    startSignIn.mockResolvedValue({ ok: true });
    renderStep();
    submitEmail('a@b.com');
    await waitFor(() => expect(onCodeSent).toHaveBeenCalledWith('a@b.com'));
  });

  it.each(['no-invite', 'verify-email', 'forbidden', 'unknown'] as const)(
    'shows the %s copy',
    async (reason) => {
      startSignIn.mockResolvedValue({ ok: false, reason });
      renderStep();
      submitEmail('a@b.com');
      expect(await screen.findByText(SIGN_IN_COPY.reasons[reason])).toBeInTheDocument();
      expect(onCodeSent).not.toHaveBeenCalled();
    },
  );
});
