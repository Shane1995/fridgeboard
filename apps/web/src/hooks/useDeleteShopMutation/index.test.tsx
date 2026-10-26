import { act, screen, waitFor } from '@testing-library/react';
import { ShopColor, SHOP_FAILURE_COPY } from '../../services/shoppingList/constants';
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
    await fakeShoppingList.addItem({ name: 'Milk', shopIds: [shop.id] });
    const result = await renderShoppingListMutation(() => useDeleteShopMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync(shop.id));

    await waitFor(() => expect(result.current.shops.data).toEqual([]));
    await waitFor(() => expect(result.current.items.data?.[0]?.shopIds).toEqual([]));
  });

  it('tells the user when the shop could not be deleted', async () => {
    const shop = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
    const result = await renderShoppingListMutation(() => useDeleteShopMutation(), 0, {
      failMethod: 'DELETE',
    });

    await act(async () => result.current.mutation.mutateAsync(shop.id));

    expect(await screen.findByText(SHOP_FAILURE_COPY.remove)).toBeInTheDocument();
    expect(result.current.shops.data).toHaveLength(1);
  });
});
