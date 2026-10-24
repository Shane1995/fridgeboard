import type { IncomingMessage } from 'node:http';

export const readBody = async (request: IncomingMessage): Promise<string> =>
  (await Array.fromAsync(request, (chunk: Buffer) => chunk.toString())).join('');
