import type { IShop } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import type { ListItemSchema } from '@fridgeboard/lambda-kit/utils/items/listItem/index.ts';

export type ToListItemOptions = { row: z.infer<typeof ListItemSchema>; shops: IShop[] };
