import '@testing-library/jest-dom/vitest';
import { resetFakeShoppingList } from './testUtils/fakeShoppingListApi';

beforeEach(() => {
  resetFakeShoppingList();
});
