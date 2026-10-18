import {
  AdminGetUserCommand,
  AdminUserGlobalSignOutCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { runSignOutEverywhere } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
const ssmMock = mockClient(SSMClient);

describe('runSignOutEverywhere', () => {
  beforeEach(() => {
    cognitoMock.reset();
    ssmMock.reset();
    ssmMock
      .on(GetParameterCommand)
      .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
    cognitoMock
      .on(AdminGetUserCommand)
      .resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });
  });

  it('signs out the normalised email in the pool from SSM', async () => {
    await runSignOutEverywhere(' Jess@Example.com ');

    expect(ssmMock.commandCalls(GetParameterCommand)[0]?.args[0].input).toEqual({
      Name: '/fridgeboard/auth/secrets',
      WithDecryption: true,
    });
    expect(cognitoMock.commandCalls(AdminUserGlobalSignOutCommand)[0]?.args[0].input).toEqual({
      UserPoolId: 'pool-1',
      Username: 'jess@example.com',
    });
  });
});
