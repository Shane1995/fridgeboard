import type { ListItem } from '../../types';
import { findDuplicates } from './index';

const item = (id: string, name: string, checked = false): ListItem => ({
  id,
  name,
  shopIds: [],
  checked,
  createdAt: 1,
});

describe('findDuplicates', () => {
  it('finds other unticked items with the same name, ignoring case and spaces', () => {
    const apples = item('a', 'Apples');
    const items = [apples, item('b', ' apples '), item('c', 'Pears')];

    expect(findDuplicates({ item: apples, items }).map(({ id }) => id)).toEqual(['b']);
  });

  it('never includes the item itself', () => {
    const apples = item('a', 'Apples');

    expect(findDuplicates({ item: apples, items: [apples] })).toEqual([]);
  });

  it('leaves out ticked items, which are already done', () => {
    const apples = item('a', 'Apples');
    const items = [apples, item('b', 'Apples', true)];

    expect(findDuplicates({ item: apples, items })).toEqual([]);
  });

  it('finds nothing for a ticked item', () => {
    const done = item('a', 'Apples', true);

    expect(findDuplicates({ item: done, items: [done, item('b', 'Apples')] })).toEqual([]);
  });
});
