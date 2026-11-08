import { AUTH_PROTOCOL_PREFIX } from '../realtime/constants.ts';

export const parseAuthProtocol = ({
  protocols,
}: {
  protocols: readonly string[];
}): string | undefined => {
  const header = protocols.find((protocol) => protocol.startsWith(AUTH_PROTOCOL_PREFIX));
  if (header === undefined) {
    return undefined;
  }
  try {
    const parsed: { Authorization?: unknown } = JSON.parse(
      Buffer.from(header.slice(AUTH_PROTOCOL_PREFIX.length), 'base64url').toString(),
    );
    return typeof parsed.Authorization === 'string' ? parsed.Authorization : undefined;
  } catch {
    return undefined;
  }
};
