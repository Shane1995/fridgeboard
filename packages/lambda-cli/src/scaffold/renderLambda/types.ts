import type { LambdaKind } from '../types.ts';

export type LambdaSpec = {
  name: string;
  kind: LambdaKind;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
