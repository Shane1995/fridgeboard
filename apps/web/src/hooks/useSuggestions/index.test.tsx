import { renderHook, waitFor } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { useSuggestions } from './index';

const names = (found: { name: string }[]) => found.map(({ name }) => name);

describe('useSuggestions', () => {
  it('suggests remembered names matching the query', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
    const { result } = renderHook(() => useSuggestions({ query: 'mi', onList: [] }), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(names(result.current)).toEqual(['Milk']));
  });

  it('leaves out names already on the list', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
    await fakeShoppingList.addItem({ name: 'Mince', shopIds: [] });
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
