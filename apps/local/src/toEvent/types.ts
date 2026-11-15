import type { IncomingMessage } from 'node:http';

export type ToEventInput = {
  request: Pick<IncomingMessage, 'method' | 'headers'>;
  body: string;
  path: string;
  query: URLSearchParams;
  routeKey: string;
  pathParameters: Record<string, string>;
};
