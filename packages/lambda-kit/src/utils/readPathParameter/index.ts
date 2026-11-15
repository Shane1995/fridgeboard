import type { ReadPathParameterOptions } from './types.ts';

export const readPathParameter = ({ user, name }: ReadPathParameterOptions): string =>
  user.event.pathParameters?.[name] ?? '';
