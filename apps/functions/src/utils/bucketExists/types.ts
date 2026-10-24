import type { ListScope } from '../resolveList/types.ts';
import type { Table } from '../table/types.ts';

export type BucketExistsOptions = { table: Table; scope: ListScope; bucketId: string };
