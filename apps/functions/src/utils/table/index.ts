import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DeleteCommand,
  type DynamoDBDocumentClient,
  GetCommand,
  paginateQuery,
  PutCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type * as z from 'zod/mini';
import { buildUpdate } from '../buildUpdate/index.ts';
import type { TableKey } from '../keys/types.ts';
import { BATCH_GET_LIMIT, UNPROCESSED_KEYS_ERROR } from './constants.ts';
import type { ItemSchema, Table } from './types.ts';

// Items come back from DynamoDB untyped. Each read names the zod schema of the item it expects,
// so what the caller gets is validated and typed, and an item of another shape is left out
// instead of being trusted.
const parseItems = <TSchema extends ItemSchema>(
  schema: TSchema,
  items: Record<string, unknown>[],
): z.infer<TSchema>[] =>
  items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });

const batchGetKeys = async (
  client: DynamoDBDocumentClient,
  TableName: string,
  Keys: TableKey[],
  retried = false,
): Promise<Record<string, unknown>[]> => {
  const { Responses, UnprocessedKeys } = await client.send(
    new BatchGetCommand({ RequestItems: { [TableName]: { Keys } } }),
  );
  const found = Responses?.[TableName] ?? [];
  const unprocessed = UnprocessedKeys?.[TableName]?.Keys ?? [];
  if (unprocessed.length === 0) {
    return found;
  }
  if (retried) {
    throw new Error(UNPROCESSED_KEYS_ERROR);
  }
  return [...found, ...(await batchGetKeys(client, TableName, toKeys(unprocessed), true))];
};

const toKeys = (keys: Record<string, unknown>[]): TableKey[] =>
  keys.flatMap(({ PK, SK }) =>
    typeof PK === 'string' && typeof SK === 'string' ? [{ PK, SK }] : [],
  );

export const createTable = (client: DynamoDBDocumentClient, TableName: string): Table => ({
  get: async (Key, schema) => {
    const { Item } = await client.send(new GetCommand({ TableName, Key, ConsistentRead: true }));
    return Item === undefined ? undefined : parseItems(schema, [Item])[0];
  },

  query: async (params, schema) => {
    const pages = await Array.fromAsync(paginateQuery({ client }, { TableName, ...params }));
    return parseItems(
      schema,
      pages.flatMap((page) => page.Items ?? []),
    );
  },

  batchGet: async (keys, schema) => {
    const chunks = Array.from({ length: Math.ceil(keys.length / BATCH_GET_LIMIT) }, (_, index) =>
      keys.slice(index * BATCH_GET_LIMIT, (index + 1) * BATCH_GET_LIMIT),
    );
    const found = await chunks.reduce<Promise<Record<string, unknown>[]>>(
      async (previous, chunk) => [
        ...(await previous),
        ...(await batchGetKeys(client, TableName, chunk)),
      ],
      Promise.resolve([]),
    );
    return parseItems(schema, found);
  },

  put: async (Item) => {
    await client.send(new PutCommand({ TableName, Item }));
  },

  update: async ({ key: Key, parts, schema }) => {
    try {
      const { Attributes } = await client.send(
        new UpdateCommand({
          TableName,
          Key,
          ...buildUpdate(parts),
          ConditionExpression: 'attribute_exists(PK)',
          ReturnValues: 'ALL_NEW',
        }),
      );
      return Attributes === undefined ? undefined : parseItems(schema, [Attributes])[0];
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return undefined;
      }
      throw error;
    }
  },

  remove: async (Key) => {
    const { Attributes } = await client.send(
      new DeleteCommand({ TableName, Key, ReturnValues: 'ALL_OLD' }),
    );
    return Attributes !== undefined;
  },

  transactWrite: async (items) => {
    await client.send(
      new TransactWriteCommand({
        TransactItems: items.map((item) =>
          'put' in item
            ? { Put: { TableName, Item: item.put } }
            : { Update: { TableName, Key: item.update, ...buildUpdate(item.parts) } },
        ),
      }),
    );
  },
});
