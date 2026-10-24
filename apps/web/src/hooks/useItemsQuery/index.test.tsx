import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { answerHouseholds } from '../../testUtils/createShoppingListWrapper';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { useShopsQuery } from '../useShopsQuery';
import { useSuggestions } from '../useSuggestions';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from './index';

describe('useItemsQuery', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads the items', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
    const { result } = renderHook(() => useItemsQuery(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Milk']));
  });

  it('asks for each list once, however often the screen renders', async () => {
    const { session, apiFetch } = createSession(SessionStatus.SignedIn);
    answerHouseholds(apiFetch);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session} client={new QueryClient()}>
        {children}
      </TestProviders>
    );
    const { result, rerender } = renderHook(
      () => ({
        items: useItemsQuery(),
        shops: useShopsQuery(),
        suggestions: useSuggestions({ query: 'mi', onList: ['Milk'] }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.items.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.shops.isSuccess).toBe(true));
    rerender();
    rerender();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const paths = apiFetch.mock.calls.map(([{ path }]) => path);
    const count = (suffix: string) => paths.filter((path) => path.endsWith(suffix)).length;

    expect(count('/households')).toBe(1);
    expect(count('/items')).toBe(1);
    expect(count('/shops')).toBe(1);
    expect(count('/history')).toBe(1);
  });
});
