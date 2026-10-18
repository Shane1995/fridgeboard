import { parseInviteArgs } from './index.ts';

describe('parseInviteArgs', () => {
  it('accepts --app', () => {
    expect(parseInviteArgs(['a@b.co', '--app'])).toMatchObject({ app: true });
  });

  it('accepts --app with --admin', () => {
    expect(parseInviteArgs(['a@b.co', '--app', '--admin'])).toMatchObject({
      app: true,
      admin: true,
    });
  });

  it('accepts --household', () => {
    expect(parseInviteArgs(['a@b.co', '--household', 'h1'])).toMatchObject({ household: 'h1' });
  });

  it('rejects neither --app nor --household', () => {
    expect(() => parseInviteArgs(['a@b.co'])).toThrow('exactly one');
  });

  it('rejects both', () => {
    expect(() => parseInviteArgs(['a@b.co', '--app', '--household', 'h1'])).toThrow('exactly one');
  });

  it('rejects --admin without --app', () => {
    expect(() => parseInviteArgs(['a@b.co', '--household', 'h1', '--admin'])).toThrow('--admin');
  });
});
