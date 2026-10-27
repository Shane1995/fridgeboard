import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { useRecipeBook } from '../../hooks/useRecipeBook';
import { MOCK_PARSE_DELAY_MS } from './constants';
import { RecipeBookProvider } from '.';

const wrapper = ({ children }: PropsWithChildren) => (
  <RecipeBookProvider>{children}</RecipeBookProvider>
);

const draft = {
  name: 'Pancakes',
  sourceUrl: '',
  photoUrl: '',
  servings: 2,
  ingredients: [],
  steps: [],
  notes: '',
  tags: [],
};

describe('RecipeBookProvider', () => {
  afterEach(() => vi.useRealTimers());

  it('starts with the mock recipes', () => {
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    expect(result.current.recipes.length).toBeGreaterThan(0);
    expect(result.current.imports).toEqual([]);
  });

  it('creates, updates, favourites and deletes a recipe', () => {
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    const before = result.current.recipes.length;

    let id = '';
    act(() => {
      id = result.current.createRecipe({ draft });
    });
    expect(result.current.recipes).toHaveLength(before + 1);

    act(() => result.current.updateRecipe({ id, draft: { ...draft, name: 'Crepes' } }));
    expect(result.current.recipes.find((recipe) => recipe.id === id)?.name).toBe('Crepes');

    act(() => result.current.toggleFavourite({ id }));
    expect(result.current.recipes.find((recipe) => recipe.id === id)?.isFavourite).toBe(true);

    act(() => result.current.deleteRecipe({ id }));
    expect(result.current.recipes).toHaveLength(before);
  });

  it('imports a link: parsing, then ready, then saved as a recipe', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    const before = result.current.recipes.length;

    let id = '';
    act(() => {
      id = result.current.startImport({ source: 'https://example.com/recipes/pesto-pasta' });
    });
    expect(result.current.imports[0]).toMatchObject({ status: 'parsing', label: 'example.com' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(MOCK_PARSE_DELAY_MS);
    });
    expect(result.current.imports[0]?.status).toBe('ready');
    expect(result.current.imports[0]?.draft?.name).toBe('Pesto Pasta');

    const importDraft = result.current.imports[0]?.draft;
    act(() => {
      if (importDraft !== undefined) {
        result.current.saveImport({ id, draft: importDraft });
      }
    });
    expect(result.current.imports).toEqual([]);
    expect(result.current.recipes).toHaveLength(before + 1);
  });

  it('returns the same import for the same link while it is not failed', () => {
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    let first = '';
    let second = '';
    act(() => {
      first = result.current.startImport({ source: 'https://example.com/a' });
    });
    act(() => {
      second = result.current.startImport({ source: 'https://example.com/a' });
    });
    expect(second).toBe(first);
    expect(result.current.imports).toHaveLength(1);
  });

  it('fails an unreadable link, then retries and discards it', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    let id = '';
    act(() => {
      id = result.current.startImport({ source: 'https://example.com/fail' });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MOCK_PARSE_DELAY_MS);
    });
    expect(result.current.imports[0]?.status).toBe('failed');
    expect(result.current.imports[0]?.reason).toBeDefined();

    act(() => result.current.retryImport({ id }));
    expect(result.current.imports[0]?.status).toBe('parsing');

    act(() => result.current.discardImport({ id }));
    expect(result.current.imports).toEqual([]);
  });
});
