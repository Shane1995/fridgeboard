import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';

export const cognitoMock = mockClient(CognitoIdentityProviderClient);
export const ssmMock = mockClient(SSMClient);
