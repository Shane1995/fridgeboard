import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { verifyCode } from '../../services/session/verifyCode';
import { useVerifyCodeMutation } from './index';

vi.mock('../../services/session/verifyCode', () => ({ verifyCode: vi.fn() }));

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      {children}
    </RemoteConfigContext.Provider>
  </QueryClientProvider>
);

describe('useVerifyCodeMutation', () => {
  it('calls verifyCode and returns its result', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('123456')).resolves.toEqual({
        ok: false,
        next: 'enter-code',
      });
    });
    expect(verifyCode).toHaveBeenCalledWith(
      '/api/v1/auth/verify',
      {
        refreshPath: '/api/v1/auth/refresh',
        refreshLeadMs: 60_000,
        refreshMinIntervalMs: 60_000,
      },
      '123456',
    );
  });

  it('registers under its mutation name', async () => {
    vi.mocked(verifyCode).mockResolvedValue({ ok: false, next: 'enter-code' });
    const { result } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('123456');
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['verifyCode']);
  });
});
