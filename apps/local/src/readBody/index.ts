export const readBody = async (request: AsyncIterable<Buffer>): Promise<string> =>
  (await Array.fromAsync(request, (chunk) => chunk.toString())).join('');
