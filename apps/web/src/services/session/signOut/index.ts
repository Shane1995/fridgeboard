import { request } from '../../api/request';
import { POST } from '../constants';

export const signOut = async (signOutPath: string): Promise<void> => {
  await request(signOutPath, { method: POST }).catch(() => undefined);
};
