import { getSession } from '../getSession';

export const getAccessToken = (): string | undefined => getSession().accessToken;
