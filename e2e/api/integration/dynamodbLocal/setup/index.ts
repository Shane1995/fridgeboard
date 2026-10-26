import { DEFAULT_LAMBDA_CONFIGURATION } from '../../../../../apps/functions/src/configuration/lambdaConfigurationSchema/constants.ts';

vi.mock('../../../../../apps/functions/src/configuration/index.ts', () => ({
  getConfiguration: async () => DEFAULT_LAMBDA_CONFIGURATION,
}));
