import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { RecipeBookProvider } from '../../../../Context/RecipeBook';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { SessionStatus } from '../../../../services/session/constants';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { useRecipes } from '.';

const { session } = createSession(SessionStatus.SignedIn);

const config = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_RECIPES]: true },
};

const wrapper = ({ children }: PropsWithChildren) => (
  <TestProviders session={session} config={config}>
    <RecipeBookProvider>{children}</RecipeBookProvider>
  </TestProviders>
);

const setup = (options: Parameters<typeof useRecipes>[0]) =>
  renderHook(() => ({ recipes: useRecipes(options), book: useRecipeBook() }), { wrapper });

describe('useRecipes', () => {
  it('starts on the list, or on a recipe from the link', () => {
    expect(
      setup({ initialRecipeId: undefined, initialUrl: undefined }).result.current.recipes.screen,
    ).toEqual({
      kind: 'list',
    });
    expect(
      setup({ initialRecipeId: 'mock-soup', initialUrl: undefined }).result.current.recipes.screen,
    ).toEqual({ kind: 'detail', recipeId: 'mock-soup' });
  });

  it('queues the shared link once', () => {
    const { result, rerender } = setup({
      initialRecipeId: undefined,
      initialUrl: 'https://example.com/recipes/shared-soup',
    });
    rerender();
    expect(result.current.book.imports).toHaveLength(1);
    expect(result.current.book.imports[0]?.source).toBe('https://example.com/recipes/shared-soup');
  });

  it('does not queue anything without a link', () => {
    const { result } = setup({ initialRecipeId: undefined, initialUrl: undefined });
    expect(result.current.book.imports).toEqual([]);
  });
});
