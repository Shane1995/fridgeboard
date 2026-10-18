import { FLOW_COOKIE, FLOW_MAX_AGE } from '../cookies/constants.ts';
import { serialiseCookie } from '../cookies/serialiseCookie/index.ts';
import { sealFlow } from '../flowToken/sealFlow/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';

export const flowResponse = (flow: AuthFlow, flowKey: string) => ({
  statusCode: 204,
  cookies: [serialiseCookie(FLOW_COOKIE, sealFlow(flow, flowKey, Date.now()), FLOW_MAX_AGE)],
});
