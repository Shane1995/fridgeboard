import { INVALID_SECRETS_ERROR } from '../../constants.ts';
import { parseSecrets } from './index.ts';

describe('parseSecrets', () => {
  it('parses a JSON secrets value', () => {
    expect(parseSecrets('{"userPoolId":"pool-1"}')).toEqual({ userPoolId: 'pool-1' });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSecrets('not json')).toThrow(INVALID_SECRETS_ERROR);
  });
});
