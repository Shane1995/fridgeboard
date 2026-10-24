import type { IBucket, IListItem } from '@fridgeboard/contract/lists';
import type { Endpoint } from '../../services/configuration/types';
import { TEST_HOUSEHOLD_ID } from '../testRepository/constants';
import type { FakeShoppingListState } from './types';

const BASE = `/api/v1/households/${TEST_HOUSEHOLD_ID}/lists/main`;
const UNSORTED = 'unsorted';
const SUB = 'sub-1';

const emptyState = (): FakeShoppingListState => ({
  items: [],
  buckets: [],
  history: [],
  counter: 0,
});

const state = { current: emptyState() };

export const resetFakeShoppingList = () => {
  state.current = emptyState();
};

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const readBody = (init: RequestInit): Record<string, unknown> =>
  typeof init.body === 'string' ? JSON.parse(init.body) : {};

const nextId = (prefix: string) => {
  state.current.counter += 1;
  return `${prefix}-${state.current.counter}`;
};

const remember = ({ name, bucketId }: { name: string; bucketId: string }) => {
  const known = state.current.history.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase(),
  );
  state.current.history =
    known === undefined
      ? [...state.current.history, { name, bucketId, count: 1 }]
      : state.current.history.map((entry) =>
          entry === known ? { name, bucketId, count: entry.count + 1 } : entry,
        );
};

const byOrder = (a: IBucket, b: IBucket) => a.order - b.order;

const handleItems = (method: string, init: RequestInit) => {
  if (method === 'GET') {
    return json(200, { items: state.current.items });
  }
  const body = readBody(init);
  const bucketId = typeof body.bucketId === 'string' ? body.bucketId : UNSORTED;
  const item: IListItem = {
    id: nextId('item'),
    name: String(body.name),
    bucketId,
    checked: false,
    createdAt: state.current.counter,
    addedBy: SUB,
  };
  state.current.items = [...state.current.items, item];
  remember(item);
  return json(201, item);
};

const handleItem = (id: string, method: string, init: RequestInit) => {
  const current = state.current.items.find((item) => item.id === id);
  if (current === undefined) {
    return json(404, { reason: 'not-found' });
  }
  if (method === 'DELETE') {
    state.current.items = state.current.items.filter((item) => item.id !== id);
    return json(204);
  }
  const updated = { ...current, ...readBody(init) };
  state.current.items = state.current.items.map((item) => (item.id === id ? updated : item));
  return json(200, updated);
};

const handleBuckets = (method: string, init: RequestInit) => {
  if (method === 'GET') {
    return json(200, { buckets: [...state.current.buckets].sort(byOrder) });
  }
  const { name, color } = readBody(init);
  const order =
    state.current.buckets.reduce((high, bucket) => Math.max(high, bucket.order), -1) + 1;
  const bucket = {
    id: nextId('bucket'),
    name: String(name),
    color: color as IBucket['color'],
    order,
  };
  state.current.buckets = [...state.current.buckets, bucket];
  return json(201, bucket);
};

const handleOrder = (init: RequestInit) => {
  const ids = readBody(init).ids as string[];
  const rank = (id: string) => (ids.includes(id) ? ids.indexOf(id) : ids.length);
  state.current.buckets = [...state.current.buckets]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order)
    .map((bucket, order) => ({ ...bucket, order }));
  return json(200, { buckets: state.current.buckets });
};

const handleBucket = (id: string, method: string, init: RequestInit) => {
  const current = state.current.buckets.find((bucket) => bucket.id === id);
  if (current === undefined) {
    return json(404, { reason: 'not-found' });
  }
  if (method === 'DELETE') {
    state.current.buckets = state.current.buckets.filter((bucket) => bucket.id !== id);
    state.current.items = state.current.items.map((item) =>
      item.bucketId === id ? { ...item, bucketId: UNSORTED } : item,
    );
    return json(204);
  }
  const updated = { ...current, ...readBody(init) };
  state.current.buckets = state.current.buckets.map((bucket) =>
    bucket.id === id ? updated : bucket,
  );
  return json(200, updated);
};

export const fakeShoppingListApi = async (
  { path }: Endpoint,
  init: RequestInit = {},
): Promise<Response> => {
  const method = init.method ?? 'GET';
  const rest = path.startsWith(BASE) ? path.slice(BASE.length) : undefined;
  if (rest === '/items') {
    return handleItems(method, init);
  }
  if (rest?.startsWith('/items/')) {
    return handleItem(rest.slice('/items/'.length), method, init);
  }
  if (rest === '/buckets') {
    return handleBuckets(method, init);
  }
  if (rest === '/buckets/order') {
    return handleOrder(init);
  }
  if (rest?.startsWith('/buckets/')) {
    return handleBucket(rest.slice('/buckets/'.length), method, init);
  }
  if (rest === '/history') {
    return json(200, { entries: state.current.history });
  }
  return json(404, { reason: 'not-found' });
};
