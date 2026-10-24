import * as z from 'zod/mini';
import { REQUEST_TIMEOUT_BOUNDS } from './constants';

export const RequestTimeoutSchema = z
  .int()
  .check(z.gte(REQUEST_TIMEOUT_BOUNDS.min), z.lte(REQUEST_TIMEOUT_BOUNDS.max));
