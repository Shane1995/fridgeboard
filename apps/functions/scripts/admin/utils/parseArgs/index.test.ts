import { parseArgs } from './index.ts';

describe('parseArgs', () => {
  it('reads the email and defaults flags to false', () => {
    expect(parseArgs(['a@b.co'])).toEqual({
      email: 'a@b.co',
      app: false,
      admin: false,
      yes: false,
    });
  });

  it('reads flags in any position', () => {
    expect(parseArgs(['--app', 'a@b.co', '--admin', '--yes'])).toEqual({
      email: 'a@b.co',
      app: true,
      admin: true,
      yes: true,
    });
  });

  it('throws without an email', () => {
    expect(() => parseArgs(['--app'])).toThrow('Usage');
  });

  it('throws on a second positional argument', () => {
    expect(() => parseArgs(['a@b.co', 'c@d.co'])).toThrow('Usage');
  });

  it('throws on an unknown flag', () => {
    expect(() => parseArgs(['a@b.co', '--nope'])).toThrow('Unknown flag --nope');
  });
});
