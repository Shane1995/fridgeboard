import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../constants';
import { CodeStep } from './index';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { SessionStatus } from '../../../../services/session/constants';

const fixture = createSession(SessionStatus.SignedIn);
const { startSignIn, verifyCode } = fixture;
const session = fixture.session;

const onSignedIn = vi.fn();
const onBack = vi.fn();

const renderStep = () =>
  render(
    <TestProviders session={session}>
      <CodeStep email="a@b.com" onSignedIn={onSignedIn} onBack={onBack} />
    </TestProviders>,
  );

const submitCode = (code: string) => {
  fireEvent.change(screen.getByLabelText(SIGN_IN_COPY.codeLabel), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.verify }));
};

describe('CodeStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('uses one-time-code numeric input constrained to 6 to 8 digits', () => {
    renderStep();
    const input = screen.getByLabelText(SIGN_IN_COPY.codeLabel);
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(input).toHaveAttribute('pattern', '\\d{6,8}');
  });

  it.each(['123456', '12345678'])('accepts the %s digit code', async (code) => {
    verifyCode.mockResolvedValue({ ok: true });
    renderStep();
    submitCode(code);
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1));
    expect(verifyCode.mock.calls[0]?.[0]).toBe(code);
  });

  it('shows the bad-code copy', async () => {
    verifyCode.mockResolvedValue({ ok: false, reason: 'bad-code' });
    renderStep();
    submitCode('123456');
    expect(await screen.findByText(SIGN_IN_COPY.reasons['bad-code'])).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('shows the expired copy and a Send a new code button that resends', async () => {
    verifyCode.mockResolvedValue({ ok: false, reason: 'expired' });
    startSignIn.mockResolvedValue({ ok: true });
    renderStep();
    submitCode('123456');
    expect(await screen.findByText(SIGN_IN_COPY.reasons.expired)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.resend }));
    expect(await screen.findByText(SIGN_IN_COPY.resent)).toBeInTheDocument();
    expect(startSignIn.mock.calls[0]?.[0]).toBe('a@b.com');
  });

  it('clears the field and confirms on next=enter-code', async () => {
    verifyCode.mockResolvedValue({ ok: false, next: 'enter-code' });
    renderStep();
    submitCode('123456');
    expect(
      await screen.findByText("You're confirmed. We've emailed you a fresh code."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(SIGN_IN_COPY.codeLabel)).toHaveValue('');
  });

  it('shows the unknown copy when the request throws', async () => {
    verifyCode.mockRejectedValue(new Error('offline'));
    renderStep();
    submitCode('123456');
    expect(await screen.findByText(SIGN_IN_COPY.reasons.unknown)).toBeInTheDocument();
  });

  it('goes back to the email step', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.useAnotherEmail }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
