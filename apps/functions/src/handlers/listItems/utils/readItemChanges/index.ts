import { LIST_ITEM_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { readShopIds } from '../../../../utils/readShopIds/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ItemChanges } from '../../routes/update/types.ts';
import type { ReadItemChangesOptions, ReadItemChangesResult } from './types.ts';

export const readItemChanges = async ({
  fields,
  table,
  scope,
}: ReadItemChangesOptions): Promise<ReadItemChangesResult> => {
  const set: ItemChanges = {};

  if ('name' in fields) {
    const name = readText({ value: fields.name, maxLength: LIST_ITEM_NAME_MAX_LENGTH });
    if (name === undefined) {
      return { status: 'invalid', reason: 'invalid-name' };
    }
    set.name = name;
  }
  const shops = await readShopIds({ fields, table, scope });
  if (shops.status === 'invalid') {
    return { status: 'invalid', reason: 'invalid-shop' };
  }
  if (shops.status === 'ok') {
    set.shopIds = shops.shopIds;
  }
  if ('checked' in fields) {
    if (typeof fields.checked !== 'boolean') {
      return { status: 'invalid', reason: 'invalid-request' };
    }
    set.checked = fields.checked;
  }
  if (Object.keys(set).length === 0) {
    return { status: 'invalid', reason: 'invalid-request' };
  }
  return { status: 'ok', set, shopsChanged: shops.status === 'ok' };
};
