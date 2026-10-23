import type { Endpoint } from '../../services/configuration/types';

export const endpoint = (path: string, timeoutMs = 10_000): Endpoint => ({ path, timeoutMs });
