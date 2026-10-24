import { act, waitFor } from '@testing-library/react';
import { ShopColor, UNSORTED_SHOP_ID } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderShoppingListMutation } from '../../testUtils/renderShoppingListMutation';
import { useDeleteShopMutation } from './index';

describe('useDeleteShopMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes the shop and refreshes shops and items', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    await fakeShoppingList.addItem({ name: 'Milk', shopId: shop.id });
    const result = await renderShoppingListMutation(() => useDeleteShopMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync(shop.id));

    await waitFor(() => expect(result.current.shops.data).toEqual([]));
    await waitFor(() => expect(result.current.items.data?.[0]?.shopId).toBe(UNSORTED_SHOP_ID));
  });
});
