import { readEmailFragment } from './index';

describe('readEmailFragment', () => {
  it('decodes the email from the fragment', () => {
    expect(readEmailFragment('#email=ann%2Bfb%40example.com')).toBe('ann+fb@example.com');
  });

  it('finds the email among other fragment params', () => {
    expect(readEmailFragment('#x=1&email=a%40b.com')).toBe('a@b.com');
  });

  it('returns undefined when there is no email', () => {
    expect(readEmailFragment('')).toBeUndefined();
    expect(readEmailFragment('#x=1')).toBeUndefined();
    expect(readEmailFragment('#email=')).toBeUndefined();
  });

  it('returns undefined for a malformed escape', () => {
    expect(readEmailFragment('#email=%E0%A4%A')).toBeUndefined();
  });
});
