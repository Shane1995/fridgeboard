import { LOCAL_HOST_PATTERN } from '../../configuration/schema/constants';
import { REALTIME_PATH } from '../constants';

export const realtimeUrl = ({ realtimeHost }: { realtimeHost: string }): string =>
  `${LOCAL_HOST_PATTERN.test(realtimeHost) ? 'ws' : 'wss'}://${realtimeHost}${REALTIME_PATH}`;
