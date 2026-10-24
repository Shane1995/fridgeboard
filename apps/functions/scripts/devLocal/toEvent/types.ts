import type { IncomingMessage } from 'node:http';

export type ToEventInput = { request: IncomingMessage; body: string; path: string };
