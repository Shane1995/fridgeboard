import { SIGN_IN_COPY } from '../../../../constants';
import { FailureReason } from '../../../../../../services/session/constants';
import { toVerifyFeedback } from './index';

describe('toVerifyFeedback', () => {
  it('has no feedback on success', () => {
    expect(toVerifyFeedback({ ok: true })).toBeUndefined();
  });

  it('confirms the fresh code on next=enter-code', () => {
    expect(toVerifyFeedback({ ok: false, next: 'enter-code' })).toEqual({
      message: SIGN_IN_COPY.confirmed,
      isError: false,
      isExpired: false,
    });
  });

  it('maps expired to an expired error', () => {
    expect(toVerifyFeedback({ ok: false, reason: FailureReason.Expired })).toEqual({
      message: SIGN_IN_COPY.reasons.expired,
      isError: true,
      isExpired: true,
    });
  });

  it('maps every other reason to its copy', () => {
    expect(toVerifyFeedback({ ok: false, reason: FailureReason.BadCode })?.message).toBe(
      SIGN_IN_COPY.reasons['bad-code'],
    );
  });
});
