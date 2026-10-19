export type AuthFlow = { email: string; session: string; kind: 'sign-up' | 'sign-in' | 'passkey' };

export type FlowPayload = AuthFlow & { exp: number };
