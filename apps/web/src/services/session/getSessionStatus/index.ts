import { getSession } from '../getSession';
import type { SessionStatus } from '../constants';

export const getSessionStatus = (): SessionStatus => getSession().status;
