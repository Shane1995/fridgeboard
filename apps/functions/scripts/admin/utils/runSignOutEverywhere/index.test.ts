import { AdminUserGlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { cognitoMock, resetAdminUserMocks, ssmMock } from '../mockAdminUser/index.ts';
import { runSignOutEverywhere } from './index.ts';

describe('runSignOutEverywhere', () => {
  beforeEach(() => {
    resetAdminUserMocks();
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
