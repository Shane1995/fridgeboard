export type BuildEventOptions = {
  claims: Record<string, string | number | boolean | string[]>;
  body?: unknown;
  method?: string;
  path?: string;
  pathParameters?: Record<string, string>;
  headers?: Record<string, string>;
};
