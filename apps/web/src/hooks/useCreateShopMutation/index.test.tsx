import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ShopColor, SHOP_FAILURE_COPY } from '../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useShopsQuery } from '../useShopsQuery';
import { useCreateShopMutation } from './index';

describe('useCreateShopMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('creates a shop and refreshes the shops query', async () => {
    const { result } = renderHook(
      () => ({ create: useCreateShopMutation(), shops: useShopsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.shops.data).toEqual([]));

    await act(async () =>
      result.current.create.mutateAsync({ name: 'Express', color: ShopColor.Mint }),
    );

    await waitFor(() =>
      expect(result.current.shops.data?.map(({ name }) => name)).toEqual(['Express']),
    );
  });

  it('tells the user when the shop could not be added', async () => {
    const { result } = renderHook(
      () => ({ create: useCreateShopMutation(), shops: useShopsQuery() }),
      { wrapper: createShoppingListWrapper({ failMethod: 'POST' }) },
    );
    await waitFor(() => expect(result.current.shops.data).toEqual([]));

    await act(async () =>
      result.current.create.mutateAsync({ name: 'Express', color: ShopColor.Mint }),
    );

    expect(await screen.findByText(SHOP_FAILURE_COPY.create)).toBeInTheDocument();
    expect(result.current.shops.data).toEqual([]);
  });
});
