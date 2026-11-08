import { subFromEmail } from './index.ts';

describe('subFromEmail', () => {
  it('is stable for the same email', () => {
    expect(subFromEmail('a@x.com')).toBe(subFromEmail('a@x.com'));
  });

  it('differs between emails', () => {
    expect(subFromEmail('a@x.com')).not.toBe(subFromEmail('b@x.com'));
  });

  it('is prefixed so it never looks like a Cognito sub', () => {
    expect(subFromEmail('a@x.com')).toMatch(/^local-[0-9a-f]{16}$/);
  });
});
