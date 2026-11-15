import { ShopColor } from '../../constants';
import { toListItem } from './index';

const ALDI = { id: 'b1', name: 'Aldi', color: 'sky', order: 0 } as const;

describe('toListItem', () => {
  it('copies the item fields', () => {
    const item = {
      id: 'i1',
      name: 'Milk',
      shops: [],
      checked: false,
      createdAt: 5,
      addedBy: 'sub-1',
    };

    expect(toListItem(item)).toEqual(item);
  });

  it('carries the shops the item is in, as app shops', () => {
    const item = toListItem({
      id: 'i1',
      name: 'Milk',
      shops: [ALDI],
      checked: false,
      createdAt: 5,
      addedBy: 'sub-1',
    });

    expect(item.shops).toEqual([{ id: 'b1', name: 'Aldi', color: ShopColor.Sky, order: 0 }]);
  });
});
