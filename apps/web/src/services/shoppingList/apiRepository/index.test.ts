import { MAIN_LIST_ID } from '@fridgeboard/contract/lists/constants';
import { fakeShoppingListApi } from '../../../testUtils/fakeShoppingListApi';
import { TEST_HOUSEHOLD_ID } from '../../../testUtils/testRepository/constants';
import { TEST_WEB_CONFIGURATION } from '../../../testUtils/webConfiguration';
import { BucketColor, UNSORTED_BUCKET_ID } from '../constants';
import { createApiShoppingListRepository } from './index';

const BASE = `/api/v1/households/${TEST_HOUSEHOLD_ID}/lists/main`;

const setup = () => {
  const fetcher = vi.fn(fakeShoppingListApi);
  const repository = createApiShoppingListRepository({
    householdId: TEST_HOUSEHOLD_ID,
    listId: MAIN_LIST_ID,
    api: TEST_WEB_CONFIGURATION.services.api,
    readTimeoutMs: 1_000,
    writeTimeoutMs: 2_000,
    fetcher,
  });
  const requests = () =>
    fetcher.mock.calls.map(([{ path, timeoutMs }, init]) => ({
      path,
      timeoutMs,
      method: init?.method ?? 'GET',
      body: init?.body,
    }));
  return { repository, requests };
};

describe('createApiShoppingListRepository', () => {
  it('adds an item with a POST to the items endpoint and returns it', async () => {
    const { repository, requests } = setup();

    const item = await repository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

    expect(item).toMatchObject({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID, checked: false });
    expect(requests()).toEqual([
      {
        path: `${BASE}/items`,
        timeoutMs: 2_000,
        method: 'POST',
        body: JSON.stringify({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID }),
      },
    ]);
  });

  it('lists items with a GET using the read timeout', async () => {
    const { repository, requests } = setup();
    await repository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

    const items = await repository.listItems();

    expect(items.map(({ name }) => name)).toEqual(['Milk']);
    expect(requests()[1]).toMatchObject({ path: `${BASE}/items`, timeoutMs: 1_000, method: 'GET' });
  });

  it('patches and deletes one item by id', async () => {
    const { repository, requests } = setup();
    const { id } = await repository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });

    const updated = await repository.updateItem({ id, changes: { checked: true } });
    await repository.deleteItem({ id });

    expect(updated.checked).toBe(true);
    expect(requests().slice(1)).toEqual([
      {
        path: `${BASE}/items/${id}`,
        timeoutMs: 2_000,
        method: 'PATCH',
        body: JSON.stringify({ checked: true }),
      },
      { path: `${BASE}/items/${id}`, timeoutMs: 2_000, method: 'DELETE', body: undefined },
    ]);
    expect(await repository.listItems()).toEqual([]);
  });

  it('clears only the ticked items', async () => {
    const { repository } = setup();
    const milk = await repository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    await repository.addItem({ name: 'Eggs', bucketId: UNSORTED_BUCKET_ID });
    await repository.updateItem({ id: milk.id, changes: { checked: true } });

    await repository.clearChecked();

    expect((await repository.listItems()).map(({ name }) => name)).toEqual(['Eggs']);
  });

  it('creates, renames, reorders and deletes buckets', async () => {
    const { repository, requests } = setup();
    const aldi = await repository.createBucket({ name: 'Aldi', color: BucketColor.Sky });
    const lidl = await repository.createBucket({ name: 'Lidl', color: BucketColor.Mint });

    const renamed = await repository.updateBucket({ id: lidl.id, changes: { name: 'Lidl GB' } });
    const reordered = await repository.reorderBuckets({ ids: [lidl.id, aldi.id] });
    await repository.deleteBucket({ id: aldi.id });

    expect(renamed.name).toBe('Lidl GB');
    expect(reordered.map(({ id }) => id)).toEqual([lidl.id, aldi.id]);
    expect((await repository.listBuckets()).map(({ id }) => id)).toEqual([lidl.id]);
    expect(requests().map(({ method, path }) => `${method} ${path}`)).toContain(
      `PUT ${BASE}/buckets/order`,
    );
  });

  it('reads the history', async () => {
    const { repository } = setup();
    await repository.addItem({ name: 'Milk', bucketId: UNSORTED_BUCKET_ID });
    await repository.addItem({ name: 'milk', bucketId: UNSORTED_BUCKET_ID });

    expect(await repository.history()).toEqual([
      { name: 'milk', bucketId: UNSORTED_BUCKET_ID, count: 2 },
    ]);
  });

  it('throws when a write fails', async () => {
    const { repository } = setup();

    await expect(repository.deleteItem({ id: 'nope' })).rejects.toThrow();
  });
});
