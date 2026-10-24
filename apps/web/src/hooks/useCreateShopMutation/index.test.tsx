import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
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
});
