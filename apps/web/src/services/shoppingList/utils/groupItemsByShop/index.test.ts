import { ShopColor, UNSORTED_SHOP_ID } from '../../constants';
import type { Shop, ListItem } from '../../types';
import { groupItemsByShop } from './index';

const shop = (id: string, order: number): Shop => ({
  id,
  name: id,
  color: ShopColor.Mint,
  order,
});
const item = (id: string, shopIds: string[], checked = false): ListItem => ({
  id,
  name: id,
  shops: shopIds.map((id) => shop(id, 0)),
  checked,
  createdAt: 0,
});

describe('groupItemsByShop', () => {
  it('keeps empty shops and hides an empty General', () => {
    const { sections } = groupItemsByShop([shop('b1', 0)], []);

    expect(sections.map(({ shop: { id } }) => id)).toEqual(['b1']);
  });

  it('puts items in their shop, in the order given', () => {
    const { sections } = groupItemsByShop(
      [shop('b1', 0), shop('b2', 1)],
      [item('a', ['b2']), item('b', ['b1']), item('c', ['b2'])],
    );

    expect(sections.map(({ items }) => items.map(({ id }) => id))).toEqual([['b'], ['a', 'c']]);
  });

  it('shows General first once it has items, including orphaned ones', () => {
    const { sections } = groupItemsByShop([shop('b1', 0)], [item('a', []), item('b', ['deleted'])]);

    expect(sections.map(({ shop: { id } }) => id)).toEqual([UNSORTED_SHOP_ID, 'b1']);
    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('keeps ticked items in their shop, in place', () => {
    const { sections } = groupItemsByShop(
      [shop('b1', 0)],
      [item('a', ['b1'], true), item('b', ['b1'])],
    );

    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('shows General when it only holds ticked items', () => {
    const { sections } = groupItemsByShop([shop('b1', 0)], [item('a', [], true)]);

    expect(sections.map(({ shop: { id } }) => id)).toEqual([UNSORTED_SHOP_ID, 'b1']);
  });

  it('shows an item in every shop it belongs to, and counts a ticked item once', () => {
    const { sections, tickedCount } = groupItemsByShop(
      [shop('express', 0), shop('ms', 1)],
      [item('a', ['express', 'ms']), item('b', ['ms'], true), item('c', ['ms', 'express'], true)],
    );

    expect(sections.map(({ items }) => items.map(({ id }) => id))).toEqual([
      ['a', 'c'],
      ['a', 'b', 'c'],
    ]);
    expect(tickedCount).toBe(2);
  });

  it('counts no ticked items on a list with none', () => {
    expect(groupItemsByShop([shop('b1', 0)], [item('a', ['b1'])]).tickedCount).toBe(0);
  });

  it('keeps an item that lost some of its shops in the ones that are left', () => {
    const { sections } = groupItemsByShop(
      [shop('express', 0)],
      [item('a', ['express', 'deleted'])],
    );

    expect(sections.map(({ shop: { id } }) => id)).toEqual(['express']);
    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['a']);
  });
});
