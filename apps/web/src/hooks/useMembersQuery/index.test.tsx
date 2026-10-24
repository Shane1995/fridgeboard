import { renderHook, waitFor } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useMembersQuery } from './index';

describe('useMembersQuery', () => {
  it('loads the members of the active household', async () => {
    const { result } = renderHook(() => useMembersQuery({ enabled: true }), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data?.members).toEqual([
        { id: 'sub-1', username: 'shane', role: 'owner' },
      ]),
    );
  });
});
