import { MAIN_LIST_ID } from '@fridgeboard/contract/lists/constants';
import { createApiShoppingListRepository } from '../../services/shoppingList/apiRepository';
import { fakeShoppingListApi } from '../fakeShoppingListApi';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';
import { TEST_HOUSEHOLD_ID } from './constants';

export const testRepository = createApiShoppingListRepository({
  householdId: TEST_HOUSEHOLD_ID,
  listId: MAIN_LIST_ID,
  api: TEST_WEB_CONFIGURATION.services.api,
  readTimeoutMs: 10_000,
  writeTimeoutMs: 10_000,
  fetcher: fakeShoppingListApi,
});
