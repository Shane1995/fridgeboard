import { secretHash } from './index.ts';

describe('secretHash', () => {
  it('matches a known HMAC-SHA256 vector', () => {
    expect(secretHash('jess@example.com', 'client-123', 'secret-abc')).toBe(
      'n0vvPRSy+pkUqGp/4Nml7yskNIP+ZFAOLepv183K42g=',
    );
  });
});
