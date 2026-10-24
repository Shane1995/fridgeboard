import { renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useSuggestionsQuery } from './index';

describe('useSuggestionsQuery', () => {
  beforeEach(() => window.localStorage.clear());

  it('suggests remembered names matching the query', async () => {
    await testRepository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    const { result } = renderHook(() => useSuggestionsQuery('mi', []), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Milk']));
  });

  it('leaves out names already on the list', async () => {
    await testRepository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    await testRepository.addItem({ name: 'Mince', bucketId: UNSORTED_BUCKET_ID });
    const { result } = renderHook(() => useSuggestionsQuery('mi', ['milk']), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Mince']));
  });

  it('does not search for an empty query', () => {
    const { result } = renderHook(() => useSuggestionsQuery('', []), {
      wrapper: createShoppingListWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
