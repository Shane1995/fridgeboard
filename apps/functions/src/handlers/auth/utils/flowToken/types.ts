export type AuthFlow = { email: string; session: string; kind: 'sign-up' | 'sign-in' };

export type FlowPayload = AuthFlow & { exp: number };
