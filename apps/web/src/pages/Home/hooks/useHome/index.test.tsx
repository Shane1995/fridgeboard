import { act, renderHook, waitFor } from '@testing-library/react';
import { BucketColor, UNSORTED_BUCKET_ID } from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../../../testUtils/createShoppingListWrapper';
import { useHome } from './index';

describe('useHome', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts loading with nothing on the list', () => {
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasItems).toBe(false);
  });

  it('groups items by bucket and offers General as a move target', async () => {
    const bucket = await fakeShoppingList.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const milk = await fakeShoppingList.addItem({ name: 'Milk', bucketId: bucket.id });
    const eggs = await fakeShoppingList.addItem({ name: 'Eggs', bucketId: bucket.id });
    await fakeShoppingList.updateItem({ id: eggs.id, changes: { checked: true } });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.hasItems).toBe(true));
    expect(result.current.grouped.sections[0]?.items).toEqual([milk]);
    expect(result.current.grouped.checked.map(({ id }) => id)).toEqual([eggs.id]);
    expect(result.current.allBuckets.map(({ id }) => id)).toEqual([UNSORTED_BUCKET_ID, bucket.id]);
  });

  it('keeps General out of the reorderable buckets', async () => {
    await fakeShoppingList.addItem({ name: 'Batteries', bucketId: UNSORTED_BUCKET_ID });
    await fakeShoppingList.createBucket({ name: 'Express', color: BucketColor.Mint });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.unsorted?.items).toHaveLength(1));
    expect(result.current.reorderable.map(({ bucket }) => bucket.name)).toEqual(['Express']);
  });

  it('reorders the buckets when one is dropped on another', async () => {
    const a = await fakeShoppingList.createBucket({ name: 'A', color: BucketColor.Mint });
    const b = await fakeShoppingList.createBucket({ name: 'B', color: BucketColor.Sky });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.reorderable).toHaveLength(2));

    act(() => result.current.handleDragEnd({ active: { id: a.id }, over: { id: b.id } } as never));

    await waitFor(async () =>
      expect((await fakeShoppingList.listBuckets()).map(({ name }) => name)).toEqual(['B', 'A']),
    );
    expect(result.current.reorderable.map(({ bucket }) => bucket.name)).toEqual(['B', 'A']);
  });

  it('ignores a drop that goes nowhere', async () => {
    const a = await fakeShoppingList.createBucket({ name: 'A', color: BucketColor.Mint });
    await fakeShoppingList.createBucket({ name: 'B', color: BucketColor.Sky });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.reorderable).toHaveLength(2));

    act(() => result.current.handleDragEnd({ active: { id: a.id }, over: null } as never));

    expect(result.current.reorderable.map(({ bucket }) => bucket.name)).toEqual(['A', 'B']);
  });
});
