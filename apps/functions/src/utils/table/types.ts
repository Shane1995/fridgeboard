import type * as z from 'zod/mini';
import type { TableKey } from '../keys/types.ts';

export type ItemSchema = z.ZodMiniType;

export type QueryParams = {
  IndexName?: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: Record<string, string>;
};

export type UpdateParts = {
  set?: Record<string, unknown>;
  add?: Record<string, number>;
};

export type TransactItem =
  | { put: TableKey & Record<string, unknown> }
  | { update: TableKey; parts: UpdateParts };

export type Table = {
  get: <TSchema extends ItemSchema>(
    key: TableKey,
    schema: TSchema,
  ) => Promise<z.infer<TSchema> | undefined>;
  query: <TSchema extends ItemSchema>(
    params: QueryParams,
    schema: TSchema,
  ) => Promise<z.infer<TSchema>[]>;
  batchGet: <TSchema extends ItemSchema>(
    keys: TableKey[],
    schema: TSchema,
  ) => Promise<z.infer<TSchema>[]>;
  put: (item: TableKey & Record<string, unknown>) => Promise<void>;
  update: <TSchema extends ItemSchema>(change: {
    key: TableKey;
    parts: UpdateParts;
    schema: TSchema;
  }) => Promise<z.infer<TSchema> | undefined>;
  remove: (key: TableKey) => Promise<boolean>;
  transactWrite: (items: TransactItem[]) => Promise<void>;
};
