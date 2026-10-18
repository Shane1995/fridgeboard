import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { SECRETS_PARAM } from '../clients/constants.ts';
import { ssm } from '../clients/index.ts';
import { INVALID_SECRETS_ERROR } from './constants.ts';

const parseSecrets = (value: string): { userPoolId?: unknown } => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(INVALID_SECRETS_ERROR);
  }
};

export const loadUserPoolId = async (): Promise<string> => {
  const { Parameter } = await ssm.send(
    new GetParameterCommand({ Name: SECRETS_PARAM, WithDecryption: true }),
  );
  const parsed = parseSecrets(Parameter?.Value ?? '{}');
  if (typeof parsed.userPoolId !== 'string') {
    throw new Error(INVALID_SECRETS_ERROR);
  }
  return parsed.userPoolId;
};
