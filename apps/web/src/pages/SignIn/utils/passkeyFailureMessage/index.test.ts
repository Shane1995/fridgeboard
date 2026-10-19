import { SIGN_IN_COPY } from '../../constants';
import { passkeyFailureMessage } from '.';

describe('passkeyFailureMessage', () => {
  it('explains when no passkey exists for the email', () => {
    expect(passkeyFailureMessage('fallback')).toBe(SIGN_IN_COPY.passkey.noPasskey);
  });

  it('explains a cancelled prompt', () => {
    expect(passkeyFailureMessage('cancelled')).toBe(SIGN_IN_COPY.passkey.cancelled);
  });

  it('maps server reasons to their copy', () => {
    expect(passkeyFailureMessage('passkey-failed')).toBe(SIGN_IN_COPY.reasons['passkey-failed']);
    expect(passkeyFailureMessage('unknown')).toBe(SIGN_IN_COPY.reasons.unknown);
  });
});
