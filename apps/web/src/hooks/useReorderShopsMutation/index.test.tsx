import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useShopsQuery } from '../useShopsQuery';
import { useReorderShopsMutation } from './index';

describe('useReorderShopsMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('reorders the shops and refreshes the shops query', async () => {
    const a = await fakeShoppingList.createShop({ name: 'A', color: ShopColor.Mint });
    const b = await fakeShoppingList.createShop({ name: 'B', color: ShopColor.Sky });
    const { result } = renderHook(
      () => ({ reorder: useReorderShopsMutation(), shops: useShopsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.shops.data).toHaveLength(2));

    await act(async () => result.current.reorder.mutateAsync([b.id, a.id]));

    await waitFor(() =>
      expect(result.current.shops.data?.map(({ name }) => name)).toEqual(['B', 'A']),
    );
  });
});
