import type { Endpoint } from '../../configuration/types';
import { request } from '../../api/request';
import { POST } from '../constants';

export const signOut = async (endpoint: Endpoint): Promise<void> => {
  await request(endpoint, { method: POST }).catch(() => undefined);
};
