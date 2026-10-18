import { sealFlow } from '../sealFlow/index.ts';
import type { AuthFlow } from '../types.ts';
import { openFlow } from './index.ts';

const KEY = 'flow-key';
const NOW = 1_700_000_000_000;
const FLOW: AuthFlow = { email: 'jess@example.com', session: 'session-1', kind: 'sign-up' };

const flipByte = (token: string, index: number): string => {
  const bytes = Buffer.from(token, 'base64url');
  bytes.writeUInt8(bytes.readUInt8(index) ^ 0xff, index);
  return bytes.toString('base64url');
};

describe('openFlow', () => {
  it('round-trips a flow within 180 seconds', () => {
    const token = sealFlow(FLOW, KEY, NOW);

    expect(openFlow(token, KEY, NOW + 180_000)).toEqual(FLOW);
  });

  it('returns undefined after 181 seconds', () => {
    const token = sealFlow(FLOW, KEY, NOW);

    expect(openFlow(token, KEY, NOW + 181_000)).toBeUndefined();
  });

  it('returns undefined for a tampered ciphertext', () => {
    const token = sealFlow(FLOW, KEY, NOW);

    expect(openFlow(flipByte(token, 14), KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for a tampered tag', () => {
    const token = sealFlow(FLOW, KEY, NOW);
    const last = Buffer.from(token, 'base64url').length - 1;

    expect(openFlow(flipByte(token, last), KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for a token sealed with another key', () => {
    expect(openFlow(sealFlow(FLOW, 'other-key', NOW), KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for malformed tokens', () => {
    expect(openFlow('', KEY, NOW)).toBeUndefined();
    expect(openFlow('abc', KEY, NOW)).toBeUndefined();
    expect(openFlow('a.b.c', KEY, NOW)).toBeUndefined();
  });
});
