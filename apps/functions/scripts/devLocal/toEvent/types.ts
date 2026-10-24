import type { IncomingMessage } from 'node:http';

export type ToEventInput = {
  request: Pick<IncomingMessage, 'method' | 'headers'>;
  body: string;
  path: string;
  routeKey: string;
  pathParameters: Record<string, string>;
};
