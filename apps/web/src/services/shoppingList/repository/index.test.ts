import { BucketColor, shoppingListStorageKey, UNSORTED_BUCKET_ID } from '../constants';
import { shoppingListRepositoryFor } from './index';

const repo = shoppingListRepositoryFor('hh-1');

describe('shoppingListRepository', () => {
  beforeEach(() => window.localStorage.clear());

  describe('buckets', () => {
    it('starts with none', async () => {
      expect(await repo.listBuckets()).toEqual([]);
    });

    it('creates buckets in order', async () => {
      const first = await repo.createBucket({ name: 'Express', color: BucketColor.Mint });
      const second = await repo.createBucket({ name: "Sainsbury's", color: BucketColor.Sky });

      expect(first.order).toBe(0);
      expect(second.order).toBe(1);
      expect((await repo.listBuckets()).map(({ name }) => name)).toEqual([
        'Express',
        "Sainsbury's",
      ]);
    });

    it('renames and recolours a bucket', async () => {
      const { id } = await repo.createBucket({ name: 'Express', color: BucketColor.Mint });

      const updated = await repo.updateBucket(id, { name: 'Tesco', color: BucketColor.Grape });

      expect(updated).toMatchObject({ name: 'Tesco', color: BucketColor.Grape });
      expect(await repo.listBuckets()).toEqual([updated]);
    });

    it('rejects updating a bucket that does not exist', async () => {
      await expect(repo.updateBucket('nope', { name: 'x' })).rejects.toThrow('bucket nope');
    });

    it('moves the items of a deleted bucket to unsorted', async () => {
      const bucket = await repo.createBucket({ name: 'Express', color: BucketColor.Mint });
      const item = await repo.addItem({ name: 'Milk', bucketId: bucket.id });

      await repo.deleteBucket(bucket.id);

      expect(await repo.listBuckets()).toEqual([]);
      expect(await repo.listItems()).toEqual([{ ...item, bucketId: UNSORTED_BUCKET_ID }]);
    });
  });

  describe('reordering buckets', () => {
    it('orders the buckets as listed', async () => {
      const a = await repo.createBucket({ name: 'A', color: BucketColor.Mint });
      const b = await repo.createBucket({ name: 'B', color: BucketColor.Sky });
      const c = await repo.createBucket({ name: 'C', color: BucketColor.Grape });

      await repo.reorderBuckets([c.id, a.id, b.id]);

      expect((await repo.listBuckets()).map(({ name }) => name)).toEqual(['C', 'A', 'B']);
    });

    it('keeps buckets left out after the listed ones', async () => {
      const a = await repo.createBucket({ name: 'A', color: BucketColor.Mint });
      const b = await repo.createBucket({ name: 'B', color: BucketColor.Sky });

      await repo.reorderBuckets([b.id]);

      expect((await repo.listBuckets()).map(({ id }) => id)).toEqual([b.id, a.id]);
    });
  });

  describe('items', () => {
    it('adds an unchecked item', async () => {
      const item = await repo.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

      expect(item).toMatchObject({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID, checked: false });
      expect(await repo.listItems()).toEqual([item]);
    });

    it('lists items oldest first', async () => {
      vi.spyOn(Date, 'now').mockReturnValueOnce(2).mockReturnValueOnce(1);
      await repo.addItem({ name: 'Second', bucketId: UNSORTED_BUCKET_ID });
      await repo.addItem({ name: 'First', bucketId: UNSORTED_BUCKET_ID });

      expect((await repo.listItems()).map(({ name }) => name)).toEqual(['First', 'Second']);
    });

    it('ticks, renames and moves an item', async () => {
      const { id } = await repo.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

      const updated = await repo.updateItem(id, {
        checked: true,
        name: 'Oat milk',
        bucketId: 'b1',
      });

      expect(updated).toMatchObject({ checked: true, name: 'Oat milk', bucketId: 'b1' });
    });

    it('rejects updating an item that does not exist', async () => {
      await expect(repo.updateItem('nope', { checked: true })).rejects.toThrow('item nope');
    });

    it('deletes an item', async () => {
      const { id } = await repo.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

      await repo.deleteItem(id);

      expect(await repo.listItems()).toEqual([]);
    });

    it('clears only the ticked items', async () => {
      const milk = await repo.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
      await repo.addItem({ name: 'Eggs', bucketId: UNSORTED_BUCKET_ID });
      await repo.updateItem(milk.id, { checked: true });

      await repo.clearChecked();

      expect((await repo.listItems()).map(({ name }) => name)).toEqual(['Eggs']);
    });
  });

  describe('suggestions', () => {
    const add = (name: string, bucketId = UNSORTED_BUCKET_ID) => repo.addItem({ name, bucketId });

    it('suggests nothing for a blank query', async () => {
      await add('Milk');

      expect(await repo.suggest('  ', [])).toEqual([]);
    });

    it('remembers names after the item is cleared, with the last bucket and a count', async () => {
      const first = await add('Milk');
      await repo.updateItem(first.id, { checked: true });
      await repo.clearChecked();
      await add('milk', 'b1');

      expect(await repo.suggest('mil', [])).toEqual([{ name: 'Milk', bucketId: 'b1', count: 2 }]);
    });

    it('puts names starting with the query first, then the commonest', async () => {
      await add('Oat milk');
      await add('Milk');
      await add('Milk');
      await add('Milky Way');

      expect((await repo.suggest('milk', [])).map(({ name }) => name)).toEqual([
        'Milk',
        'Milky Way',
        'Oat milk',
      ]);
    });

    it('leaves out names already on the list, ignoring case', async () => {
      await add('Milk');
      await add('Mince');

      expect((await repo.suggest('mi', ['MILK'])).map(({ name }) => name)).toEqual(['Mince']);
    });

    it('returns at most five', async () => {
      await Promise.all(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map((name) => add(name)));

      expect(await repo.suggest('a', [])).toHaveLength(5);
    });
  });

  it('survives unreadable stored data', async () => {
    window.localStorage.setItem(shoppingListStorageKey('hh-1'), '{not json');

    expect(await repo.listItems()).toEqual([]);
    expect(await repo.listBuckets()).toEqual([]);
  });
});
