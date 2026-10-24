import type { BucketColor } from '../../services/shoppingList/constants';
import type { ItemChanges } from '../../services/shoppingList/types';

export type AddFakeItem = { name: string; bucketId: string };

export type AddFakeBucket = { name: string; color: BucketColor };

export type UpdateFakeItem = { id: string; changes: ItemChanges };
