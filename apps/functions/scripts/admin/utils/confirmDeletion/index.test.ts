import { confirmDeletion } from './index.ts';

describe('confirmDeletion', () => {
  it('accepts a re-typed email ignoring case and spaces', async () => {
    expect(await confirmDeletion('a@b.co', async () => ' A@B.co ')).toBe(true);
  });

  it('rejects a different answer', async () => {
    expect(await confirmDeletion('a@b.co', async () => 'yes')).toBe(false);
  });
});
