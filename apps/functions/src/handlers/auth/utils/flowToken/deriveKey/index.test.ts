import { KEY_LENGTH } from '../constants.ts';
import { deriveKey } from './index.ts';

describe('deriveKey', () => {
  it('derives a stable key of the cipher length', () => {
    const key = deriveKey('flow-key');

    expect(key).toHaveLength(KEY_LENGTH);
    expect(key.equals(deriveKey('flow-key'))).toBe(true);
  });

  it('derives a different key for a different secret', () => {
    expect(deriveKey('flow-key').equals(deriveKey('other-key'))).toBe(false);
  });
});
