import { shoppingListStorageKey } from '../../constants';
import { testRepository } from '../../../../testUtils/testRepository';
import { seedDemoList } from './index';

describe('seedDemoList', () => {
  beforeEach(() => window.localStorage.clear());

  it('fills an empty list with buckets and items, some ticked', async () => {
    seedDemoList('hh-1');

    expect((await testRepository.listBuckets()).length).toBeGreaterThan(0);
    const items = await testRepository.listItems();
    expect(items.some(({ checked }) => checked)).toBe(true);
    expect(items.some(({ checked }) => !checked)).toBe(true);
  });

  it('leaves an existing list alone', async () => {
    window.localStorage.setItem(
      shoppingListStorageKey('hh-1'),
      '{"buckets":[],"items":[],"history":[]}',
    );

    seedDemoList('hh-1');

    expect(await testRepository.listItems()).toEqual([]);
  });
});
