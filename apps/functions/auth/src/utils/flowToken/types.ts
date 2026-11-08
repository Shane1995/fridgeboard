import type { AuthFlowKind } from './constants.ts';

export type AuthFlow = { email: string; session: string; kind: AuthFlowKind };

export type FlowPayload = AuthFlow & { exp: number };
