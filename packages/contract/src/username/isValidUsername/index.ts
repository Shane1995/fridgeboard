import { USERNAME_PATTERN } from '../constants.ts';
import type { UsernameLimits } from './types.ts';

export const isValidUsername = (username: string, { min, max }: UsernameLimits): boolean =>
  username.length >= min && username.length <= max && USERNAME_PATTERN.test(username);
