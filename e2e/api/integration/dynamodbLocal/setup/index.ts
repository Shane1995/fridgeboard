import { DEFAULT_LAMBDA_CONFIGURATION } from '@fridgeboard/lambda-kit/configuration/lambdaConfigurationSchema/constants.ts';

vi.mock('@fridgeboard/lambda-kit/configuration/index.ts', () => ({
  getConfiguration: async () => DEFAULT_LAMBDA_CONFIGURATION,
}));
