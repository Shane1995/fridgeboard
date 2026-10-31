import { Readable } from 'node:stream';
import { readBody } from './index.ts';

describe('readBody', () => {
  it('joins the chunks into one string', async () => {
    expect(await readBody(Readable.from([Buffer.from('{"a"'), Buffer.from(':1}')]))).toBe(
      '{"a":1}',
    );
  });

  it('returns an empty string for no body', async () => {
    expect(await readBody(Readable.from([]))).toBe('');
  });
});
