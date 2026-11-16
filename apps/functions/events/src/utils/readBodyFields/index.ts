import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import type { ReadBodyFieldsOptions } from './types.ts';

export const readBodyFields = ({ user }: ReadBodyFieldsOptions): Record<string, unknown> => {
  const body = readJsonBody(user.event);
  return typeof body === 'object' && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {};
};
