import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { signOut } from '../../services/session/signOut';
import { useSignOutMutation } from './index';

vi.mock('../../services/session/signOut', () => ({ signOut: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSignOutMutation', () => {
  it('calls signOut and returns its result', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignOutMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync()).resolves.toEqual(undefined);
    });
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
