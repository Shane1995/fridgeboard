import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { NO_SUB_ERROR } from './constants.ts';
import { resolveUser } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
const ssmMock = mockClient(SSMClient);

describe('resolveUser', () => {
  beforeEach(() => {
    cognitoMock.reset();
    ssmMock.reset();
    ssmMock
      .on(GetParameterCommand)
      .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
  });

  it('resolves the pool, normalised username and sub', async () => {
    cognitoMock
      .on(AdminGetUserCommand)
      .resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });

    await expect(resolveUser(' Jess@Example.com')).resolves.toEqual({
      userPoolId: 'pool-1',
      username: 'jess@example.com',
      sub: 'u1',
    });
  });

  it('throws when the user has no sub attribute', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({ UserAttributes: [] });

    await expect(resolveUser('jess@example.com')).rejects.toThrow(NO_SUB_ERROR);
  });
});
