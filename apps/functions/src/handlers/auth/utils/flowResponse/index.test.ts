import { FLOW_COOKIE } from '../cookies/constants.ts';
import { readCookie } from '../cookies/readCookie/index.ts';
import { openFlow } from '../flowToken/openFlow/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';
import { flowResponse } from './index.ts';
import { AuthFlowKind } from '../../utils/flowToken/constants.ts';

const FLOW: AuthFlow = {
  email: 'jess@example.com',
  session: 'session-1',
  kind: AuthFlowKind.SignIn,
};

describe('flowResponse', () => {
  it('returns 204 with a sealed flow cookie', () => {
    const response = flowResponse(FLOW, 'flow-key', 180_000);
    const token = readCookie(response.cookies, FLOW_COOKIE);

    expect(response.statusCode).toBe(204);
    expect(openFlow(token ?? '', 'flow-key', Date.now())).toEqual(FLOW);
  });

  it('derives the cookie Max-Age from the ttl', () => {
    const response = flowResponse(FLOW, 'flow-key', 90_000);

    expect(response.cookies?.[0]).toMatch(/Max-Age=90$/);
  });
});
