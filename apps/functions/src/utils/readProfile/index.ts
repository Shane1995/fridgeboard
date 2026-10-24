import { profileKey } from '../keys/profileKey/index.ts';
import { ProfileItemSchema } from '../items/profileItem/index.ts';
import type { Table } from '../table/types.ts';
import type { Profile } from './types.ts';

export const readProfile = async (table: Table, sub: string): Promise<Profile | undefined> => {
  const item = await table.get(profileKey(sub), ProfileItemSchema);
  return item === undefined
    ? undefined
    : {
        email: item.email,
        username: item.username ?? null,
        canCreateHousehold: item.canCreateHousehold === true,
      };
};
