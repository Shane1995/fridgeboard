import { joinLink } from './index.ts';

describe('joinLink', () => {
  it('puts the encoded normalised email in the fragment', () => {
    expect(joinLink(' Jess+x@Example.com ')).toBe(
      'https://app.fridgeboard.uk/join#email=jess%2Bx%40example.com',
    );
  });

  it('has no query string', () => {
    expect(joinLink('a@b.co')).not.toContain('?');
  });
});
