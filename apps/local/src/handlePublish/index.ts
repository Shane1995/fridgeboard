import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { JSON_HEADERS } from '../../../functions/src/utils/jsonResponse/constants.ts';
import { CHANNEL_PREFIX, MAX_EVENTS_PER_PUBLISH } from '../realtime/constants.ts';
import type { RealtimeHub } from '../realtime/types.ts';

const isEvents = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= MAX_EVENTS_PER_PUBLISH &&
  value.every((event) => typeof event === 'string');

const respond = (statusCode: number, body: object): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: { ...JSON_HEADERS },
  body: JSON.stringify(body),
});

export const handlePublish = ({
  body,
  hub,
}: {
  body: string;
  hub: RealtimeHub;
}): APIGatewayProxyStructuredResultV2 => {
  try {
    const parsed: { channel?: unknown; events?: unknown } = JSON.parse(body);
    if (
      typeof parsed.channel !== 'string' ||
      !parsed.channel.startsWith(CHANNEL_PREFIX) ||
      !isEvents(parsed.events)
    ) {
      return respond(400, { reason: 'invalid-publish' });
    }
    hub.publish({ channel: parsed.channel, events: parsed.events });
    return respond(200, {
      successful: parsed.events.map((_, index) => ({ identifier: String(index), index })),
      failed: [],
    });
  } catch {
    return respond(400, { reason: 'invalid-publish' });
  }
};
