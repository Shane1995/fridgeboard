import { Hash } from '@smithy/hash-node';
import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';
import { MISSING_CREDENTIALS_ERROR, SIGNING_SERVICE } from './constants.ts';
import type { SignRequestOptions } from './types.ts';

const readCredentials = async () => {
  const accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
  const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
  if (accessKeyId === undefined || secretAccessKey === undefined) {
    throw new Error(MISSING_CREDENTIALS_ERROR);
  }
  const sessionToken = process.env['AWS_SESSION_TOKEN'];
  return { accessKeyId, secretAccessKey, ...(sessionToken !== undefined && { sessionToken }) };
};

export const signRequest = async ({
  url,
  body,
}: SignRequestOptions): Promise<Record<string, string>> => {
  const { hostname, pathname } = new URL(url);
  const signer = new SignatureV4({
    service: SIGNING_SERVICE,
    region: String(process.env['AWS_REGION']),
    credentials: readCredentials,
    sha256: Hash.bind(null, 'sha256'),
  });
  const signed = await signer.sign(
    new HttpRequest({
      method: 'POST',
      protocol: 'https:',
      hostname,
      path: pathname,
      headers: { host: hostname, 'content-type': 'application/json' },
      body,
    }),
  );
  return signed.headers;
};
