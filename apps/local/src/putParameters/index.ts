import { ParameterAlreadyExists, PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import { TAVILY_PARAMETER, TAVILY_PLACEHOLDER } from '../bootstrap/constants.ts';

export const putParameters = async ({ ssm }: { ssm: SSMClient }): Promise<void> => {
  try {
    await ssm.send(
      new PutParameterCommand({
        Name: TAVILY_PARAMETER,
        Value: TAVILY_PLACEHOLDER,
        Type: 'SecureString',
      }),
    );
  } catch (error) {
    if (!(error instanceof ParameterAlreadyExists)) {
      throw error;
    }
  }
};
