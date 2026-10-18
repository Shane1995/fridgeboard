import { FLOW_COOKIE } from '../cookies/constants.ts';
import { readCookie } from '../cookies/readCookie/index.ts';
import { openFlow } from '../flowToken/openFlow/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';
import { flowResponse } from './index.ts';

const FLOW: AuthFlow = { email: 'jess@example.com', session: 'session-1', kind: 'sign-in' };

describe('flowResponse', () => {
  it('returns 204 with a sealed flow cookie', () => {
    const response = flowResponse(FLOW, 'flow-key');
    const token = readCookie(response.cookies, FLOW_COOKIE);

    expect(response.statusCode).toBe(204);
    expect(openFlow(token ?? '', 'flow-key', Date.now())).toEqual(FLOW);
  });
});
