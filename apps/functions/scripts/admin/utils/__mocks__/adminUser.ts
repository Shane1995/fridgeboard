import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';

export const cognitoMock = mockClient(CognitoIdentityProviderClient);
export const ssmMock = mockClient(SSMClient);

export const resetAdminUserMocks = (): void => {
  cognitoMock.reset();
  ssmMock.reset();
  ssmMock
    .on(GetParameterCommand)
    .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
  cognitoMock.on(AdminGetUserCommand).resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });
};
