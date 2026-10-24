import { renderHook, waitFor } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useMemberName } from './index';

describe('useMemberName', () => {
  it('finds the username of a member by id', async () => {
    const { result } = renderHook(() => useMemberName({ id: 'sub-1', enabled: true }), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(result.current).toBe('shane'));
  });

  it('has no name for someone who is not a member', async () => {
    const { result } = renderHook(() => useMemberName({ id: 'sub-9', enabled: true }), {
      wrapper: createShoppingListWrapper(),
    });

    await Promise.resolve();

    expect(result.current).toBeUndefined();
  });

  it('does not ask for the members while it is not needed', async () => {
    const wrapper = createShoppingListWrapper();
    const { result } = renderHook(() => useMemberName({ id: 'sub-1', enabled: false }), {
      wrapper,
    });

    await Promise.resolve();

    expect(result.current).toBeUndefined();
  });
});
