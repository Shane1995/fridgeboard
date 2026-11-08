import { PassThrough } from 'node:stream';
import { promptUser } from './index.ts';

describe('promptUser', () => {
  it('returns the line typed after the question', async () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const answer = promptUser('Sure? ', input, output);
    input.write('a@b.co\n');

    await expect(answer).resolves.toBe('a@b.co');
    expect(output.read()?.toString()).toContain('Sure? ');
  });
});
