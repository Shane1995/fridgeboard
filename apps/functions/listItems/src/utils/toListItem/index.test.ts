import { toListItem } from './index.ts';

const SHOPS = [
  { id: 'a', name: 'Aldi', color: 'sky', order: 0 },
  { id: 'b', name: 'Lidl', color: 'mint', order: 1 },
] as const;
const ROW = { id: 'i1', name: 'Milk', checked: true, createdAt: 1, addedBy: 'sub-1' };

describe('toListItem', () => {
  it('carries the shops of the item, in the order the item names them', () => {
    const item = toListItem({ row: { ...ROW, shopIds: ['b', 'a'] }, shops: [...SHOPS] });

    expect(item.shops).toEqual([SHOPS[1], SHOPS[0]]);
  });

  it('leaves out a shop that no longer exists', () => {
    const item = toListItem({ row: { ...ROW, shopIds: ['a', 'gone'] }, shops: [...SHOPS] });

    expect(item.shops).toEqual([SHOPS[0]]);
  });

  it('has no shops for a row without any', () => {
    expect(toListItem({ row: ROW, shops: [...SHOPS] }).shops).toEqual([]);
  });

  it('drops the keys and keeps the item fields', () => {
    expect(toListItem({ row: { ...ROW, PK: 'HH#1', SK: 'ITEM#main#i1' }, shops: [] })).toEqual({
      id: 'i1',
      name: 'Milk',
      shops: [],
      checked: true,
      createdAt: 1,
      addedBy: 'sub-1',
    });
  });
});
