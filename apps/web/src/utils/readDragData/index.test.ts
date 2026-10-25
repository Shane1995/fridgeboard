import { readDraggedItem, readDropShopId } from './index';

const ITEM = { id: 'i1', name: 'Apples', shopIds: ['b1'], checked: false, createdAt: 1 };

describe('readDraggedItem', () => {
  it('reads an item and the shop it was dragged from', () => {
    expect(readDraggedItem({ type: 'item', item: ITEM, fromShopId: 'b1' })).toEqual({
      item: ITEM,
      fromShopId: 'b1',
    });
  });

  it.each([
    ['nothing', undefined],
    ['a shop card', { type: 'shop' }],
    ['an item without a shop it came from', { type: 'item', item: ITEM }],
    ['an item that is not an item', { type: 'item', item: { id: 7 }, fromShopId: 'b1' }],
    ['something that is not data', 'item'],
  ])('reads nothing from %s', (_label, data) => {
    expect(readDraggedItem(data)).toBeUndefined();
  });
});

describe('readDropShopId', () => {
  it('reads the shop of a card an item can be dropped on', () => {
    expect(readDropShopId({ type: 'shop-drop', shopId: 'b2' })).toBe('b2');
  });

  it.each([
    ['nothing', undefined],
    ['a shop reorder target', { type: 'shop' }],
    ['a drop zone without a shop', { type: 'shop-drop' }],
  ])('reads nothing from %s', (_label, data) => {
    expect(readDropShopId(data)).toBeUndefined();
  });
});
