import { FLOW_COOKIE } from '../cookies/constants.ts';
import { serialiseCookie } from '../cookies/serialiseCookie/index.ts';
import { flowMaxAge } from '../flowMaxAge/index.ts';
import { sealFlow } from '../flowToken/sealFlow/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';

export const flowCookie = (flow: AuthFlow, flowKey: string, ttlMs: number): string =>
  serialiseCookie(FLOW_COOKIE, sealFlow(flow, flowKey, Date.now(), ttlMs), flowMaxAge(ttlMs));
