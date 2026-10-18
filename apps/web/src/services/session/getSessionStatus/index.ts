import { getSession } from '../getSession';
import type { SessionStatus } from '../types';

export const getSessionStatus = (): SessionStatus => getSession().status;
