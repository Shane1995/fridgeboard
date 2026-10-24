import { renderHook, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { TestProviders } from '../../testUtils/TestProviders';
import { NO_HOUSEHOLD_MESSAGE } from './constants';
import { useListParams } from './index';

describe('useListParams', () => {
  it('fills the household and the main list, with any extra parameters', async () => {
    const { result } = renderHook(() => useListParams(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.householdId).toBe('hh-1'));

    expect(result.current.paramsFor({ itemId: 'i1' })).toEqual({
      householdId: 'hh-1',
      listId: 'main',
      itemId: 'i1',
    });
    expect(result.current.queryKeyFor('items')).toEqual([
      'items',
      { householdId: 'hh-1', listId: 'main' },
    ]);
  });

  it('refuses to build parameters before a household is known', () => {
    const { session } = createSession(SessionStatus.SignedIn);
    const { result } = renderHook(() => useListParams(), {
      wrapper: ({ children }) => <TestProviders session={session}>{children}</TestProviders>,
    });

    expect(() => result.current.paramsFor()).toThrow(NO_HOUSEHOLD_MESSAGE);
  });
});
