import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../constants';
import { EmailStep } from './index';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { SessionStatus } from '../../../../services/session/constants';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: vi.fn(),
  startAuthentication: vi.fn(),
}));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_PASSKEYS]: true,
  },
};

const fixture = createSession(SessionStatus.SignedIn);
const { startSignIn, startPasskeySignIn, verifyPasskey } = fixture;
const session = fixture.session;

const onCodeSent = vi.fn();

const renderStep = (initialEmail?: string, config = TEST_WEB_CONFIGURATION) =>
  render(
    <TestProviders session={session} config={config}>
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

  describe('passkey button', () => {
    const passkeyButton = () => screen.getByRole('button', { name: SIGN_IN_COPY.passkey.submit });

    beforeEach(() => {
      vi.mocked(browserSupportsWebAuthn).mockReturnValue(true);
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

    afterEach(() => window.localStorage.clear());

    it('is hidden when the flag is off', () => {
      renderStep();

      expect(
        screen.queryByRole('button', { name: SIGN_IN_COPY.passkey.submit }),
      ).not.toBeInTheDocument();
    });

    it('is hidden when the browser cannot do passkeys', () => {
      vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);

      renderStep(undefined, PASSKEYS_ON);

      expect(
        screen.queryByRole('button', { name: SIGN_IN_COPY.passkey.submit }),
      ).not.toBeInTheDocument();
    });

    it('signs in with the typed email and remembers it for next time', async () => {
      renderStep('jess@example.com', PASSKEYS_ON);

      fireEvent.click(passkeyButton());

      await waitFor(() => expect(verifyPasskey).toHaveBeenCalledTimes(1));
      expect(startPasskeySignIn).toHaveBeenCalledWith('jess@example.com');
      await waitFor(() =>
        expect(window.localStorage.getItem('fb:passkey-email')).toBe('jess@example.com'),
      );
    });

    it('asks for an email first', () => {
      renderStep(undefined, PASSKEYS_ON);

      fireEvent.click(passkeyButton());

      expect(screen.getByText(SIGN_IN_COPY.passkey.emailRequired)).toBeInTheDocument();
      expect(startPasskeySignIn).not.toHaveBeenCalled();
    });

    it('says when no passkey exists for the email', async () => {
      startPasskeySignIn.mockResolvedValue({ ok: false, fallback: true });
      renderStep('jess@example.com', PASSKEYS_ON);

      fireEvent.click(passkeyButton());

      expect(await screen.findByText(SIGN_IN_COPY.passkey.noPasskey)).toBeInTheDocument();
      expect(window.localStorage.getItem('fb:passkey-email')).toBeNull();
    });

    it('says when the prompt is cancelled', async () => {
      vi.mocked(startAuthentication).mockRejectedValue(new Error('NotAllowedError'));
      renderStep('jess@example.com', PASSKEYS_ON);

      fireEvent.click(passkeyButton());

      expect(await screen.findByText(SIGN_IN_COPY.passkey.cancelled)).toBeInTheDocument();
    });

    it('shows the generic message when the request throws', async () => {
      startPasskeySignIn.mockRejectedValue(new Error('network'));
      renderStep('jess@example.com', PASSKEYS_ON);

      fireEvent.click(passkeyButton());

      expect(await screen.findByText(SIGN_IN_COPY.reasons.unknown)).toBeInTheDocument();
    });
  });
});
