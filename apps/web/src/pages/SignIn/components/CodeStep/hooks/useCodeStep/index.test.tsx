import { act, renderHook } from '@testing-library/react';
import { FailureReason, SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { SIGN_IN_COPY } from '../../../../constants';
import { useCodeStep } from './index';

const submit = { preventDefault: vi.fn() };

const setup = () => {
  const fixture = createSession(SessionStatus.SignedOut);
  const onSignedIn = vi.fn();
  const { result } = renderHook(() => useCodeStep({ email: 'jess@example.com', onSignedIn }), {
    wrapper: createProvidersWrapper(fixture.session),
  });
  return { result, onSignedIn, ...fixture };
};

describe('useCodeStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('verifies the trimmed code and signs in', async () => {
    const { result, verifyCode, onSignedIn } = setup();
    verifyCode.mockResolvedValue({ ok: true });

    act(() => result.current.setCode(' 123456 '));
    await act(async () => result.current.handleSubmit(submit));

    expect(submit.preventDefault).toHaveBeenCalled();
    expect(verifyCode).toHaveBeenCalledWith('123456');
    expect(onSignedIn).toHaveBeenCalled();
  });

  it('clears the code and confirms when the server asks for a fresh code', async () => {
    const { result, verifyCode, onSignedIn } = setup();
    verifyCode.mockResolvedValue({ ok: false, next: 'enter-code' });

    act(() => result.current.setCode('123456'));
    await act(async () => result.current.handleSubmit(submit));

    expect(result.current.code).toBe('');
    expect(result.current.feedback).toEqual({
      message: SIGN_IN_COPY.confirmed,
      isError: false,
      isExpired: false,
    });
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('shows the failure and offers a resend when the code has expired', async () => {
    const { result, verifyCode } = setup();
    verifyCode.mockResolvedValue({ ok: false, reason: FailureReason.Expired });

    await act(async () => result.current.handleSubmit(submit));

    expect(result.current.feedback).toMatchObject({
      message: SIGN_IN_COPY.reasons[FailureReason.Expired],
      isError: true,
      isExpired: true,
    });
  });

  it('shows the generic message when verification throws', async () => {
    const { result, verifyCode } = setup();
    verifyCode.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleSubmit(submit));

    expect(result.current.feedback?.isError).toBe(true);
  });

  it('resends the code, clears the input and says so', async () => {
    const { result, startSignIn } = setup();
    startSignIn.mockResolvedValue({ ok: true });
    act(() => result.current.setCode('123456'));

    await act(async () => result.current.handleResend());

    expect(startSignIn).toHaveBeenCalledWith('jess@example.com');
    expect(result.current.code).toBe('');
    expect(result.current.feedback).toEqual({
      message: SIGN_IN_COPY.resent,
      isError: false,
      isExpired: false,
    });
  });

  it('shows the reason when the resend fails', async () => {
    const { result, startSignIn } = setup();
    startSignIn.mockResolvedValue({ ok: false, reason: FailureReason.Forbidden });

    await act(async () => result.current.handleResend());

    expect(result.current.feedback?.message).toBe(SIGN_IN_COPY.reasons[FailureReason.Forbidden]);
  });
});
