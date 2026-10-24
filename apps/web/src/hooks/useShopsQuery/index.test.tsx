import { renderHook, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useShopsQuery } from './index';

describe('useShopsQuery', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads the shops in order', async () => {
    await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
    const { result } = renderHook(() => useShopsQuery(), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Express']));
  });
});
