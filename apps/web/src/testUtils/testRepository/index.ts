import { shoppingListRepositoryFor } from '../../services/shoppingList/repository';

export const TEST_HOUSEHOLD_ID = 'hh-1';

export const testRepository = shoppingListRepositoryFor(TEST_HOUSEHOLD_ID);
