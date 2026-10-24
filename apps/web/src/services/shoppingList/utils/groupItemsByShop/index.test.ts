import { ShopColor, UNSORTED_SHOP_ID } from '../../constants';
import type { Shop, ListItem } from '../../types';
import { groupItemsByShop } from './index';

const shop = (id: string, order: number): Shop => ({
  id,
  name: id,
  color: ShopColor.Mint,
  order,
});
const item = (id: string, shopId: string, checked = false): ListItem => ({
  id,
  name: id,
  shopId,
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
      [item('a', 'b2'), item('b', 'b1'), item('c', 'b2')],
    );

    expect(sections.map(({ items }) => items.map(({ id }) => id))).toEqual([['b'], ['a', 'c']]);
  });

  it('shows General first once it has items, including orphaned ones', () => {
    const { sections } = groupItemsByShop(
      [shop('b1', 0)],
      [item('a', UNSORTED_SHOP_ID), item('b', 'deleted')],
    );

    expect(sections.map(({ shop: { id } }) => id)).toEqual([UNSORTED_SHOP_ID, 'b1']);
    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('moves ticked items out of their shop into checked', () => {
    const { sections, checked } = groupItemsByShop(
      [shop('b1', 0)],
      [item('a', 'b1', true), item('b', 'b1')],
    );

    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['b']);
    expect(checked.map(({ id }) => id)).toEqual(['a']);
  });
});
