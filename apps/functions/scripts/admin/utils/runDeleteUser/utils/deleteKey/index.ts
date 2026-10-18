import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import type { Key } from '../../../buildDeletePlan/types.ts';
import { TABLE_NAME } from '../../../clients/constants.ts';
import { doc } from '../../../clients/index.ts';

export const deleteKey = (key: Key): Promise<unknown> =>
  doc.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: key['PK'], SK: key['SK'] } }));
