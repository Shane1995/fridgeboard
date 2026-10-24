import { shoppingListStorageKey } from '../../constants';
import { readState } from './index';

const ID = 'hh-1';

const store = (state: object) =>
  window.localStorage.setItem(shoppingListStorageKey(ID), JSON.stringify(state));

const item = (name: string, bucketId: string) => ({
  id: name,
  name,
  bucketId,
  checked: false,
  createdAt: 0,
});

describe('readState', () => {
  beforeEach(() => window.localStorage.clear());

  it('is empty when nothing is stored', () => {
    expect(readState(ID)).toEqual({ buckets: [], items: [], history: [] });
  });

  it('is empty when the stored text is not JSON', () => {
    window.localStorage.setItem(shoppingListStorageKey(ID), '{nope');

    expect(readState(ID)).toEqual({ buckets: [], items: [], history: [] });
  });

  it('keeps the stored history', () => {
    const history = [{ name: 'Milk', bucketId: 'b1', count: 4 }];
    store({ buckets: [], items: [], history });

    expect(readState(ID).history).toEqual(history);
  });

  it('builds history from the items when a list saved earlier has none', () => {
    store({ buckets: [], items: [item('Milk', 'b1'), item('milk', 'b2'), item('Eggs', 'b1')] });

    expect(readState(ID).history).toEqual([
      { name: 'Milk', bucketId: 'b2', count: 2 },
      { name: 'Eggs', bucketId: 'b1', count: 1 },
    ]);
  });
});
