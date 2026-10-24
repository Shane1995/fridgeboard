export type ListParams = {
  householdId: string | undefined;
  listId: string;
  paramsFor: (extra?: Record<string, string>) => Record<string, string>;
  queryKeyFor: (name: string) => readonly [string, Record<string, string>];
};
