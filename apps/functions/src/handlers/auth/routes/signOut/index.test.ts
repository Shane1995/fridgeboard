import {
  CognitoIdentityProviderClient,
  InvalidParameterException,
  RevokeTokenCommand,
  UnauthorizedException,
  UnsupportedTokenTypeException,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { signOut } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-123',
  clientSecret: 'secret-abc',
  flowKey: 'flow-key',
};
const CLEARED_REFRESH_COOKIE =
  'fb_rt=; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=0';
const request = { isBase64Encoded: false, cookies: ['fb_rt=old-refresh'] };

describe('signOut route', () => {
  beforeEach(() => {
    cognitoMock.reset();
  });

  it('revokes the token and clears the cookie', async () => {
    cognitoMock.on(RevokeTokenCommand).resolves({});

    const result = await signOut(request, SECRETS);

    expect(cognitoMock.commandCalls(RevokeTokenCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      ClientSecret: 'secret-abc',
      Token: 'old-refresh',
    });
    expect(result.statusCode).toBe(204);
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
  });

  it('clears the cookie without calling Cognito when the token is missing', async () => {
    const result = await signOut({ isBase64Encoded: false }, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('still signs out with a garbage token', async () => {
    cognitoMock
      .on(RevokeTokenCommand)
      .rejects(new UnsupportedTokenTypeException({ message: 'x', $metadata: {} }));

    const result = await signOut({ isBase64Encoded: false, cookies: ['fb_rt=garbage'] }, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
  });

  it.each([
    ['InvalidParameterException', new InvalidParameterException({ message: 'x', $metadata: {} })],
    ['UnauthorizedException', new UnauthorizedException({ message: 'x', $metadata: {} })],
  ])('clears the cookie on %s', async (_name, error) => {
    cognitoMock.on(RevokeTokenCommand).rejects(error);

    const result = await signOut(request, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
  });

  it('keeps the cookie when Cognito is throttling', async () => {
    cognitoMock.on(RevokeTokenCommand).rejects(new Error('throttled'));

    await expect(signOut(request, SECRETS)).rejects.toThrow('throttled');
  });
});
