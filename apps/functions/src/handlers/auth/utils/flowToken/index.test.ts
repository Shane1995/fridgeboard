import { signFlow, verifyFlow } from './index.ts';
import type { AuthFlow } from './index.ts';

const KEY = 'flow-key';
const NOW = 1_700_000_000_000;
const FLOW: AuthFlow = { email: 'jess@example.com', session: 'session-1', kind: 'sign-up' };

describe('flowToken', () => {
  it('round-trips a flow within 180 seconds', () => {
    const token = signFlow(FLOW, KEY, NOW);

    expect(verifyFlow(token, KEY, NOW + 180_000)).toEqual(FLOW);
  });

  it('returns undefined after 181 seconds', () => {
    const token = signFlow(FLOW, KEY, NOW);

    expect(verifyFlow(token, KEY, NOW + 181_000)).toBeUndefined();
  });

  it('returns undefined for a tampered payload', () => {
    const [, signature] = signFlow(FLOW, KEY, NOW).split('.');
    const forged = Buffer.from(
      JSON.stringify({ ...FLOW, email: 'eve@example.com', exp: NOW + 180_000 }),
    ).toString('base64url');

    expect(verifyFlow(`${forged}.${signature}`, KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for a tampered signature', () => {
    const token = signFlow(FLOW, KEY, NOW);

    expect(verifyFlow(`${token.slice(0, -2)}xx`, KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for a token signed with another key', () => {
    expect(verifyFlow(signFlow(FLOW, 'other-key', NOW), KEY, NOW)).toBeUndefined();
  });

  it('returns undefined for malformed tokens', () => {
    expect(verifyFlow('', KEY, NOW)).toBeUndefined();
    expect(verifyFlow('abc', KEY, NOW)).toBeUndefined();
    expect(verifyFlow('a.b.c', KEY, NOW)).toBeUndefined();
  });
});
