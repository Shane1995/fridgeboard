import { readCookie } from '../cookies/readCookie/index.ts';
import { openFlow } from '../flowToken/openFlow/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';
import { flowCookie } from './index.ts';

const FLOW: AuthFlow = { email: 'jess@example.com', session: 's1', kind: 'passkey' };

describe('flowCookie', () => {
  it('seals the flow into the flow cookie with the matching lifetime', () => {
    const cookie = flowCookie(FLOW, 'flow-key', 180_000);

    expect(cookie).toMatch(
      /^fb_auth_flow=[\w-]+; Secure; HttpOnly; SameSite=Strict; Path=\/api\/v1\/auth; Max-Age=\d+$/,
    );
    const value = readCookie([cookie], 'fb_auth_flow');
    expect(openFlow(value ?? '', 'flow-key', Date.now())).toEqual(FLOW);
  });
});
