import type { AuthFlow } from '../types.ts';
import { openFlow } from '../openFlow/index.ts';
import { sealFlow } from './index.ts';
import { AuthFlowKind } from '../../../utils/flowToken/constants.ts';

const KEY = 'flow-key';
const TTL = 180_000;
const NOW = 1_700_000_000_000;
const FLOW: AuthFlow = {
  email: 'jess@example.com',
  session: 'session-1',
  kind: AuthFlowKind.SignUp,
};

describe('sealFlow', () => {
  it('does not reveal the email, kind or session in the token', () => {
    const token = sealFlow(FLOW, KEY, NOW, TTL);
    const decoded = Buffer.from(token, 'base64url').toString('latin1');

    [token, decoded].forEach((text) => {
      expect(text).not.toContain('jess@example.com');
      expect(text).not.toContain('sign-up');
      expect(text).not.toContain('session-1');
    });
  });

  it('uses a fresh IV for every token', () => {
    expect(sealFlow(FLOW, KEY, NOW, TTL)).not.toBe(sealFlow(FLOW, KEY, NOW, TTL));
  });

  it('expires the token after the given ttl', () => {
    const token = sealFlow(FLOW, KEY, NOW, 60_000);

    expect(openFlow(token, KEY, NOW + 60_000)).toEqual(FLOW);
    expect(openFlow(token, KEY, NOW + 60_001)).toBeUndefined();
  });
});
