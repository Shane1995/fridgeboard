import { AUTH_PROTOCOL_PREFIX } from '../constants';
import type { BuildAuthProtocolOptions } from './types';

export const buildAuthProtocol = ({ token, httpHost }: BuildAuthProtocolOptions): string => {
  const encoded = btoa(JSON.stringify({ Authorization: token, host: httpHost }))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return `${AUTH_PROTOCOL_PREFIX}${encoded}`;
};
