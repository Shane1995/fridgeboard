import { getConfiguration } from '../../configuration/index.ts';
import { signRequest } from '../signRequest/index.ts';
import {
  APPSYNC_EVENTS_SERVICE,
  CHANNEL_PREFIX,
  EVENT_PATH,
  PUBLISH_FAILED_LOG,
  PUBLISH_TIMEOUT_MS,
  UNKNOWN_ERROR,
} from './constants.ts';
import type { PublishChangeOptions } from './types.ts';

export const publishChange = async ({ householdId, change }: PublishChangeOptions) => {
  try {
    const { services } = await getConfiguration();
    const host = services[APPSYNC_EVENTS_SERVICE]?.url;
    if (host === undefined) {
      return;
    }
    const url = `${host}${EVENT_PATH}`;
    const body = JSON.stringify({
      channel: `${CHANNEL_PREFIX}${householdId}`,
      events: [JSON.stringify(change)],
    });
    const response = await fetch(url, {
      method: 'POST',
      headers: await signRequest({ url, body }),
      body,
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(PUBLISH_FAILED_LOG, response.status);
    }
  } catch (error) {
    console.error(PUBLISH_FAILED_LOG, error instanceof Error ? error.name : UNKNOWN_ERROR);
  }
};
