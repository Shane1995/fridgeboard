import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getMe } from '../../services/api/getMe';
import { clearSession } from '../../services/session/clearSession';
import { useMeQuery } from './index';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
};

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('useMeQuery', () => {
  it('loads /me through getMe', async () => {
    vi.mocked(getMe).mockResolvedValue(ME);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
  });

  it('does not request /me once signed out', async () => {
    clearSession();
    renderHook(() => useMeQuery(), { wrapper });

    await Promise.resolve();

    expect(getMe).not.toHaveBeenCalled();
  });

  it('caches under the me query name', async () => {
    vi.mocked(getMe).mockResolvedValue(ME);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(client.getQueryData(['me'])).toEqual(ME);
  });
});
