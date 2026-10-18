import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { startSignIn } from '../../../../services/session/startSignIn';
import { verifyCode } from '../../../../services/session/verifyCode';
import { SIGN_IN_COPY } from '../../constants';
import { CodeStep } from './index';

vi.mock('../../../../services/session/verifyCode', () => ({ verifyCode: vi.fn() }));
vi.mock('../../../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));

const onSignedIn = vi.fn();
const onBack = vi.fn();

const renderStep = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CodeStep email="a@b.com" onSignedIn={onSignedIn} onBack={onBack} />
    </QueryClientProvider>,
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
    vi.mocked(verifyCode).mockResolvedValue({ ok: true });
    renderStep();
    submitCode(code);
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1));
    expect(vi.mocked(verifyCode).mock.calls[0]?.[0]).toBe(code);
  });

  it('shows the bad-code copy', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, reason: 'bad-code' });
    renderStep();
    submitCode('123456');
    expect(await screen.findByText(SIGN_IN_COPY.reasons['bad-code'])).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('shows the expired copy and a Send a new code button that resends', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, reason: 'expired' });
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    renderStep();
    submitCode('123456');
    expect(await screen.findByText(SIGN_IN_COPY.reasons.expired)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.resend }));
    expect(await screen.findByText(SIGN_IN_COPY.resent)).toBeInTheDocument();
    expect(vi.mocked(startSignIn).mock.calls[0]?.[0]).toBe('a@b.com');
  });

  it('clears the field and confirms on next=enter-code', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, next: 'enter-code' });
    renderStep();
    submitCode('123456');
    expect(
      await screen.findByText("You're confirmed. We've emailed you a fresh code."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(SIGN_IN_COPY.codeLabel)).toHaveValue('');
  });

  it('shows the unknown copy when the request throws', async () => {
    vi.mocked(verifyCode).mockRejectedValue(new Error('offline'));
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
