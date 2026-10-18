import type { AuthFlow } from '../types.ts';
import { sealFlow } from './index.ts';

const KEY = 'flow-key';
const NOW = 1_700_000_000_000;
const FLOW: AuthFlow = { email: 'jess@example.com', session: 'session-1', kind: 'sign-up' };

describe('sealFlow', () => {
  it('does not reveal the email, kind or session in the token', () => {
    const token = sealFlow(FLOW, KEY, NOW);
    const decoded = Buffer.from(token, 'base64url').toString('latin1');

    [token, decoded].forEach((text) => {
      expect(text).not.toContain('jess@example.com');
      expect(text).not.toContain('sign-up');
      expect(text).not.toContain('session-1');
    });
  });

  it('uses a fresh IV for every token', () => {
    expect(sealFlow(FLOW, KEY, NOW)).not.toBe(sealFlow(FLOW, KEY, NOW));
  });
});
