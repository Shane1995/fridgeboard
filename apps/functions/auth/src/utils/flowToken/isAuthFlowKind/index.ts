import { AuthFlowKind } from '../constants.ts';

export const isAuthFlowKind = (value: unknown): value is AuthFlowKind =>
  Object.values<unknown>(AuthFlowKind).includes(value);
