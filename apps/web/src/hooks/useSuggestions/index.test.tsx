import { renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { testRepository } from '../../testUtils/testRepository';
import { useSuggestions } from './index';

const names = (found: { name: string }[]) => found.map(({ name }) => name);

describe('useSuggestions', () => {
  it('suggests remembered names matching the query', async () => {
    await testRepository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    const { result } = renderHook(() => useSuggestions({ query: 'mi', onList: [] }), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(names(result.current)).toEqual(['Milk']));
  });

  it('leaves out names already on the list', async () => {
    await testRepository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    await testRepository.addItem({ name: 'Mince', bucketId: UNSORTED_BUCKET_ID });
    const { result } = renderHook(() => useSuggestions({ query: 'mi', onList: ['milk'] }), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(names(result.current)).toEqual(['Mince']));
  });

  it('does not search for an empty query', () => {
    const { result } = renderHook(() => useSuggestions({ query: '', onList: [] }), {
      wrapper: createShoppingListWrapper(),
    });

    expect(result.current).toEqual([]);
  });
});
