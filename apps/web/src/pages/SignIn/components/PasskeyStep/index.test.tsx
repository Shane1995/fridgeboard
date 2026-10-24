import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { startAuthentication } from '@simplewebauthn/browser';
import { SessionStatus } from '../../../../services/session/constants';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { FailureReason } from '../../../../services/session/constants';
import { SIGN_IN_COPY } from '../../constants';
import { PasskeyStep } from '.';

vi.mock('@simplewebauthn/browser', () => ({ startAuthentication: vi.fn() }));

const COPY = SIGN_IN_COPY.passkey;
const { session, startPasskeySignIn, verifyPasskey } = createSession(SessionStatus.SignedOut);
const onFallback = vi.fn();

const renderStep = () =>
  render(
    <TestProviders session={session}>
      <PasskeyStep email="jess@example.com" onFallback={onFallback} />
    </TestProviders>,
  );

const tap = () => fireEvent.click(screen.getByRole('button', { name: COPY.submit }));

describe('PasskeyStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    startPasskeySignIn.mockResolvedValue({ ok: true, options: { challenge: 'abc' } });
    vi.mocked(startAuthentication).mockResolvedValue({
      id: 'c',
      rawId: 'c',
      type: 'public-key',
      response: { clientDataJSON: 'cd', authenticatorData: 'ad', signature: 's' },
      clientExtensionResults: {},
    });
    verifyPasskey.mockResolvedValue({ ok: true });
  });

  it('shows who is signing in and offers Face ID first', () => {
    renderStep();

    expect(screen.getByText('jess@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.submit })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.useCode })).toBeInTheDocument();
  });

  it('signs in with the remembered email when Face ID is tapped', async () => {
    renderStep();

    tap();

    await waitFor(() => expect(verifyPasskey).toHaveBeenCalledTimes(1));
    expect(startPasskeySignIn).toHaveBeenCalledWith('jess@example.com');
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('switches to the email code when the server has no passkey', async () => {
    startPasskeySignIn.mockResolvedValue({ ok: false, reason: FailureReason.Fallback });
    renderStep();

    tap();

    await waitFor(() => expect(onFallback).toHaveBeenCalledTimes(1));
  });

  it('stays put with a message when Face ID is cancelled', async () => {
    vi.mocked(startAuthentication).mockRejectedValue(new Error('NotAllowedError'));
    renderStep();

    tap();

    expect(
      await screen.findByText(SIGN_IN_COPY.reasons[FailureReason.Cancelled]),
    ).toBeInTheDocument();
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('shows the failure reason when verification fails', async () => {
    verifyPasskey.mockResolvedValue({ ok: false, reason: FailureReason.PasskeyFailed });
    renderStep();

    tap();

    expect(await screen.findByText(SIGN_IN_COPY.reasons['passkey-failed'])).toBeInTheDocument();
  });

  it('shows the generic message when the request throws', async () => {
    startPasskeySignIn.mockRejectedValue(new Error('network'));
    renderStep();

    tap();

    expect(await screen.findByText(SIGN_IN_COPY.reasons.unknown)).toBeInTheDocument();
  });

  it('lets the person choose the email code', () => {
    renderStep();

    fireEvent.click(screen.getByRole('button', { name: COPY.useCode }));

    expect(onFallback).toHaveBeenCalledTimes(1);
  });
});
