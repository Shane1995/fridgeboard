import { AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { cognitoMock, ssmMock } from './scripts/admin/utils/__mocks__/adminUser.ts';

beforeEach(() => {
  cognitoMock.reset();
  ssmMock.reset();
  ssmMock
    .on(GetParameterCommand)
    .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
  cognitoMock.on(AdminGetUserCommand).resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });
});
