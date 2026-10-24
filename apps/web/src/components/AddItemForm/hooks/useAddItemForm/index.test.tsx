import { act, renderHook, waitFor } from '@testing-library/react';
import {
  BucketColor,
  LAST_BUCKET_STORAGE_KEY,
  UNSORTED_BUCKET_ID,
} from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../../../testUtils/createShoppingListWrapper';
import { useAddItemForm } from './index';

describe('useAddItemForm', () => {
  beforeEach(() => window.localStorage.clear());

  it('offers General first and defaults to it', async () => {
    await fakeShoppingList.createBucket({ name: 'Express', color: BucketColor.Mint });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.buckets).toHaveLength(2));
    expect(result.current.buckets[0]?.id).toBe(UNSORTED_BUCKET_ID);
    expect(result.current.bucketId).toBe(UNSORTED_BUCKET_ID);
  });

  it('adds the trimmed name to the chosen bucket, clears the input and remembers the bucket', async () => {
    const bucket = await fakeShoppingList.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.buckets).toHaveLength(2));

    act(() => {
      result.current.setBucketId(bucket.id);
      result.current.setName('  Milk ');
    });
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

    await waitFor(() => expect(result.current.name).toBe(''));
    expect((await fakeShoppingList.listItems())[0]).toMatchObject({
      name: 'Milk',
      bucketId: bucket.id,
    });
    expect(window.localStorage.getItem(LAST_BUCKET_STORAGE_KEY)).toBe(bucket.id);
  });

  it('suggests remembered names and brings back their bucket when picked', async () => {
    const bucket = await fakeShoppingList.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const bought = await fakeShoppingList.addItem({ name: 'Milk', bucketId: bucket.id });
    await fakeShoppingList.updateItem({ id: bought.id, changes: { checked: true } });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.buckets).toHaveLength(2));

    act(() => result.current.setName('mi'));
    await waitFor(() =>
      expect(result.current.suggestions.map(({ name }) => name)).toEqual(['Milk']),
    );
    act(() => result.current.pickSuggestion(result.current.suggestions[0]!));

    expect(result.current.name).toBe('Milk');
    expect(result.current.bucketId).toBe(bucket.id);
    await waitFor(() => expect(result.current.suggestions).toEqual([]));
  });

  it('does not suggest an item that is already on the list', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    const mince = await fakeShoppingList.addItem({
      name: 'Mince',
      bucketId: UNSORTED_BUCKET_ID,
    });
    await fakeShoppingList.updateItem({ id: mince.id, changes: { checked: true } });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    act(() => result.current.setName('mi'));

    await waitFor(() =>
      expect(result.current.suggestions.map(({ name }) => name)).toEqual(['Mince']),
    );
  });

  it('ignores a blank name', async () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    act(() => result.current.setName('   '));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

    expect(await fakeShoppingList.listItems()).toEqual([]);
  });
});
