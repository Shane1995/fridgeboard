export type CreateTransactionParams = {
  TableName: string | undefined;
  id: string;
  sub: string;
  name: string;
  isAdmin: boolean;
  now: string;
};
