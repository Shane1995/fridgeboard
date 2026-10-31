import type { IncomingMessage } from 'node:http';

export type LocalRequest = Pick<IncomingMessage, 'method' | 'url' | 'headers'> &
  AsyncIterable<Buffer>;
