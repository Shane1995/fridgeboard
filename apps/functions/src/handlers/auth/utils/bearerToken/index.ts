const BEARER_PATTERN = /^bearer (\S+)$/i;

export const bearerToken = (headers: Record<string, string | undefined>): string | undefined =>
  BEARER_PATTERN.exec(headers.authorization ?? '')?.[1];
