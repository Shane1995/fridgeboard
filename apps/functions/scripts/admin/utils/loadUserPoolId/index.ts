import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { SECRETS_PARAM, ssm } from '../clients/index.ts';
import { INVALID_SECRETS_ERROR } from './constants.ts';

export const loadUserPoolId = async (): Promise<string> => {
  const { Parameter } = await ssm.send(
    new GetParameterCommand({ Name: SECRETS_PARAM, WithDecryption: true }),
  );
  const parsed: { userPoolId?: unknown } = JSON.parse(Parameter?.Value ?? '{}');
  if (typeof parsed.userPoolId !== 'string') {
    throw new Error(INVALID_SECRETS_ERROR);
  }
  return parsed.userPoolId;
};
