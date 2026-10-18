import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  NotAuthorizedException,
  RefreshTokenReuseException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { refresh } from './index.ts';

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

describe('refresh route', () => {
  beforeEach(() => {
    cognitoMock.reset();
  });

  it('rotates the cookie and returns a new access token', async () => {
    cognitoMock.on(GetTokensFromRefreshTokenCommand).resolves({
      AuthenticationResult: {
        AccessToken: 'access-2',
        ExpiresIn: 900,
        RefreshToken: 'new-refresh',
      },
    });

    const result = await refresh(request, SECRETS);

    expect(cognitoMock.commandCalls(GetTokensFromRefreshTokenCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      ClientSecret: 'secret-abc',
      RefreshToken: 'old-refresh',
    });
    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({ 'content-type': 'application/json' });
    expect(JSON.parse(result.body ?? '')).toEqual({ accessToken: 'access-2', expiresIn: 900 });
    expect(result.cookies).toEqual([
      'fb_rt=new-refresh; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=315360000',
    ]);
  });

  it('returns 401 and clears fb_rt when Cognito rejects the token', async () => {
    cognitoMock
      .on(GetTokensFromRefreshTokenCommand)
      .rejects(new NotAuthorizedException({ message: 'revoked', $metadata: {} }));

    const result = await refresh(request, SECRETS);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'unauthorised' });
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
  });

  it.each([
    ['RefreshTokenReuseException', new RefreshTokenReuseException({ message: 'x', $metadata: {} })],
    ['UserNotFoundException', new UserNotFoundException({ message: 'x', $metadata: {} })],
  ])('returns 401 and clears fb_rt on %s', async (_name, error) => {
    cognitoMock.on(GetTokensFromRefreshTokenCommand).rejects(error);

    const result = await refresh(request, SECRETS);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'unauthorised' });
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
  });

  it('returns 401 and clears fb_rt when the cookie is missing', async () => {
    const result = await refresh({ isBase64Encoded: false }, SECRETS);

    expect(result.statusCode).toBe(401);
    expect(result.cookies).toEqual([CLEARED_REFRESH_COOKIE]);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('keeps the cookie when Cognito fails for another reason', async () => {
    cognitoMock.on(GetTokensFromRefreshTokenCommand).rejects(new Error('throttled'));

    await expect(refresh(request, SECRETS)).rejects.toThrow('throttled');
  });
});
