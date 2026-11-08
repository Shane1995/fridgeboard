import { AuthFlowKind } from '../constants.ts';
import { isAuthFlowKind } from './index.ts';

describe('isAuthFlowKind', () => {
  it.each(Object.values(AuthFlowKind))('accepts %s', (kind) => {
    expect(isAuthFlowKind(kind)).toBe(true);
  });

  it.each([undefined, null, '', 'SIGN-IN', 'sign_in', 1])('rejects %s', (value) => {
    expect(isAuthFlowKind(value)).toBe(false);
  });
});
