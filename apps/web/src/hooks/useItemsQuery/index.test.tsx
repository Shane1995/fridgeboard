import { renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from './index';

describe('useItemsQuery', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads the items', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    const { result } = renderHook(() => useItemsQuery(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Milk']));
  });
});
