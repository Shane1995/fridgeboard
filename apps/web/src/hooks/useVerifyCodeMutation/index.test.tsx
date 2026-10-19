import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { SessionStatus } from '../../services/session/constants';
import { useVerifyCodeMutation } from './index';
const { session, verifyCode } = createSession(SessionStatus.SignedOut);

const client = new QueryClient();
const wrapper = createSessionWrapper(session, client);

describe('useVerifyCodeMutation', () => {
  it('calls verifyCode and returns its result', async () => {
    verifyCode.mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('123456')).resolves.toEqual({
        ok: false,
        next: 'enter-code',
      });
    });
    expect(verifyCode).toHaveBeenCalledWith('123456');
  });

  it('registers under its mutation name', async () => {
    verifyCode.mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('123456');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['verifyCode']);
  });
});
