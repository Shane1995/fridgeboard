import { act, renderHook } from '@testing-library/react';
import { MOCK_RECIPES } from '../../../../../../../../Context/RecipeBook/constants';
import { useAddToList } from '.';

const bolognese = MOCK_RECIPES[0];

const setup = () => {
  const onDone = vi.fn();
  const hook = renderHook(() => {
    if (bolognese === undefined) {
      throw new Error('missing mock recipe');
    }
    return useAddToList({ recipe: bolognese, onDone });
  });
  return { ...hook, onDone };
};

const lineFor = ({
  lines,
  item,
}: {
  lines: ReturnType<typeof setup>['result']['current']['lines'];
  item: string;
}) => lines.find((line) => line.ingredient.item === item);

describe('useAddToList', () => {
  it('ticks what is needed and leaves staples and items already on the list unticked', () => {
    const { result } = setup();
    const { lines } = result.current;
    expect(lineFor({ lines, item: 'beef mince' })?.row.ticked).toBe(true);
    expect(lineFor({ lines, item: 'olive oil' })?.row.ticked).toBe(false);
    expect(lineFor({ lines, item: 'onions' })?.onList).toBe(true);
    expect(lineFor({ lines, item: 'onions' })?.row.ticked).toBe(false);
    expect(result.current.count).toBe(4);
  });

  it('pre-fills the suggested shop and swaps to an alternative in one tap', () => {
    const { result } = setup();
    const mince = lineFor({ lines: result.current.lines, item: 'beef mince' });
    expect(mince?.row.shopIds).toEqual(['sainsburys']);
    act(() => result.current.swapShop({ id: mince?.ingredient.id ?? '', shopId: 'express' }));
    expect(lineFor({ lines: result.current.lines, item: 'beef mince' })?.row.shopIds).toEqual([
      'express',
    ]);
  });

  it('lets one item sit in several shops', () => {
    const { result } = setup();
    const id = lineFor({ lines: result.current.lines, item: 'beef mince' })?.ingredient.id ?? '';
    act(() => result.current.toggleShop({ id, shopId: 'market' }));
    expect(lineFor({ lines: result.current.lines, item: 'beef mince' })?.row.shopIds).toEqual([
      'sainsburys',
      'market',
    ]);
    act(() => result.current.toggleShop({ id, shopId: 'sainsburys' }));
    expect(lineFor({ lines: result.current.lines, item: 'beef mince' })?.row.shopIds).toEqual([
      'market',
    ]);
  });

  it('scales quantities with the servings and never below one', () => {
    const { result } = setup();
    act(() => result.current.changeServings({ by: 4 }));
    expect(result.current.servings).toBe(8);
    expect(result.current.factor).toBe(2);
    act(() => result.current.changeServings({ by: -20 }));
    expect(result.current.servings).toBe(1);
  });

  it('counts only ticked items that are not already on the list, and closes on submit', () => {
    const { result, onDone } = setup();
    const id = lineFor({ lines: result.current.lines, item: 'olive oil' })?.ingredient.id ?? '';
    act(() => result.current.toggleTick({ id }));
    expect(result.current.count).toBe(5);
    act(() => result.current.submit());
    expect(onDone).toHaveBeenCalled();
  });
});
