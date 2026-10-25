import type { IShop, IListItem } from '@fridgeboard/contract/lists';
import type { Endpoint } from '../../services/configuration/types';
import { TEST_HOUSEHOLD_ID } from '../fakeShoppingList/constants';
import type { FakeShoppingListState } from './types';

const BASE = `/api/v1/households/${TEST_HOUSEHOLD_ID}/lists/main`;
const SUB = 'sub-1';

const emptyState = (): FakeShoppingListState => ({
  items: [],
  shops: [],
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

const remember = ({ name, shopIds }: { name: string; shopIds: string[] }) => {
  const known = state.current.history.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase(),
  );
  state.current.history =
    known === undefined
      ? [...state.current.history, { name, shopIds, count: 1 }]
      : state.current.history.map((entry) =>
          entry === known ? { name, shopIds, count: entry.count + 1 } : entry,
        );
};

const byOrder = (a: IShop, b: IShop) => a.order - b.order;

const handleItems = (method: string, init: RequestInit) => {
  if (method === 'GET') {
    return json(200, { items: state.current.items });
  }
  const body = readBody(init);
  const shopIds = Array.isArray(body.shopIds) ? body.shopIds.map(String) : [];
  const item: IListItem = {
    id: nextId('item'),
    name: String(body.name),
    shopIds,
    checked: false,
    createdAt: state.current.counter,
    addedBy: SUB,
  };
  state.current.items = [...state.current.items, item];
  remember({ name: item.name, shopIds });
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
  const changes = readBody(init);
  const shopIds = Array.isArray(changes.shopIds) ? changes.shopIds.map(String) : current.shopIds;
  const updated = { ...current, ...changes, shopIds };
  state.current.items = state.current.items.map((item) => (item.id === id ? updated : item));
  return json(200, updated);
};

const handleShops = (method: string, init: RequestInit) => {
  if (method === 'GET') {
    return json(200, { shops: [...state.current.shops].sort(byOrder) });
  }
  const { name, color } = readBody(init);
  const order = state.current.shops.reduce((high, shop) => Math.max(high, shop.order), -1) + 1;
  const shop = {
    id: nextId('shop'),
    name: String(name),
    color: color as IShop['color'],
    order,
  };
  state.current.shops = [...state.current.shops, shop];
  return json(201, shop);
};

const handleOrder = (init: RequestInit) => {
  const ids = readBody(init).ids as string[];
  const rank = (id: string) => (ids.includes(id) ? ids.indexOf(id) : ids.length);
  state.current.shops = [...state.current.shops]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order)
    .map((shop, order) => ({ ...shop, order }));
  return json(200, { shops: state.current.shops });
};

const handleShop = (id: string, method: string, init: RequestInit) => {
  const current = state.current.shops.find((shop) => shop.id === id);
  if (current === undefined) {
    return json(404, { reason: 'not-found' });
  }
  if (method === 'DELETE') {
    state.current.shops = state.current.shops.filter((shop) => shop.id !== id);
    state.current.items = state.current.items.map((item) => {
      const shopIds = item.shopIds.filter((shopId) => shopId !== id);
      return { ...item, shopIds };
    });
    return json(204);
  }
  const updated = { ...current, ...readBody(init) };
  state.current.shops = state.current.shops.map((shop) => (shop.id === id ? updated : shop));
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
  if (rest === '/shops') {
    return handleShops(method, init);
  }
  if (rest === '/shops/order') {
    return handleOrder(init);
  }
  if (rest?.startsWith('/shops/')) {
    return handleShop(rest.slice('/shops/'.length), method, init);
  }
  if (rest === '/history') {
    return json(200, { entries: state.current.history });
  }
  return json(404, { reason: 'not-found' });
};
