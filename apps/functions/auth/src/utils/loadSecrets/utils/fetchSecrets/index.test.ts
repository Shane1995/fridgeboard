import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { INVALID_SECRETS_ERROR } from '../../constants.ts';
import { fetchSecrets } from './index.ts';

const ssmMock = mockClient(SSMClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  flowKey: 'flow-1',
};

describe('fetchSecrets', () => {
  beforeEach(() => {
    ssmMock.reset();
    vi.stubEnv('SECRETS_PARAM', '/fridgeboard/auth/secrets');
  });

  it('reads and parses the decrypted SSM parameter', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: JSON.stringify(SECRETS) } });

    await expect(fetchSecrets()).resolves.toEqual(SECRETS);
  });

  it('throws when a secret is missing', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: '{}' } });

    await expect(fetchSecrets()).rejects.toThrow(INVALID_SECRETS_ERROR);
  });
});
