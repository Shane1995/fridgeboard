import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../constants';
import { EmailStep } from './index';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { SessionStatus } from '../../../../services/session/constants';

const fixture = createSession(SessionStatus.SignedIn);
const { startSignIn } = fixture;
const session = fixture.session;

const onCodeSent = vi.fn();

const renderStep = (initialEmail?: string) =>
  render(
    <TestProviders session={session}>
      <EmailStep initialEmail={initialEmail} onCodeSent={onCodeSent} />
    </TestProviders>,
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
