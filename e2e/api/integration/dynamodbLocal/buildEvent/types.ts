export type BuildEventOptions = {
  claims: Record<string, string | number | boolean | string[]>;
  body?: unknown;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
};
