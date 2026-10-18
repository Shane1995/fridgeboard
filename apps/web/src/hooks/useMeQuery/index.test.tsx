import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getMe } from '../../services/api/getMe';
import { useMeQuery } from './index';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useMeQuery', () => {
  it('loads /me through getMe', async () => {
    vi.mocked(getMe).mockResolvedValue(ME);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
  });
});
