import { isPendingItem } from './index';

describe('isPendingItem', () => {
  it('is true for an item that is still being saved', () => {
    expect(isPendingItem({ id: 'pending-1' })).toBe(true);
  });

  it('is false for a saved item', () => {
    expect(isPendingItem({ id: 'abc' })).toBe(false);
  });
});
