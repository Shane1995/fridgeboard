import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ShopColor, SHOP_FAILURE_COPY } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useShopsQuery } from '../useShopsQuery';
import { useUpdateShopMutation } from './index';

describe('useUpdateShopMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('renames a shop and refreshes the shops query', async () => {
    const { id } = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const { result } = renderHook(
      () => ({ update: useUpdateShopMutation(), shops: useShopsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.shops.data).toHaveLength(1));

    await act(async () => result.current.update.mutateAsync({ id, changes: { name: 'Tesco' } }));

    await waitFor(() => expect(result.current.shops.data?.[0]?.name).toBe('Tesco'));
  });

  it('tells the user when the shop could not be saved', async () => {
    const { id } = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
    const { result } = renderHook(
      () => ({ update: useUpdateShopMutation(), shops: useShopsQuery() }),
      { wrapper: createShoppingListWrapper({ failMethod: 'PATCH' }) },
    );
    await waitFor(() => expect(result.current.shops.data).toHaveLength(1));

    await act(async () => result.current.update.mutateAsync({ id, changes: { name: 'Tesco' } }));

    expect(await screen.findByText(SHOP_FAILURE_COPY.update)).toBeInTheDocument();
    expect(result.current.shops.data?.[0]?.name).toBe('Express');
  });
});
