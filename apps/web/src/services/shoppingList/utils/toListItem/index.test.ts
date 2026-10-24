import { toListItem } from './index';

describe('toListItem', () => {
  it('copies the item fields', () => {
    const item = {
      id: 'i1',
      name: 'Milk',
      shopId: 'unsorted',
      checked: false,
      createdAt: 5,
      addedBy: 'sub-1',
    };

    expect(toListItem(item)).toEqual(item);
  });
});
