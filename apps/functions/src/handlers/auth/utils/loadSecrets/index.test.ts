import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';

const ssmMock = mockClient(SSMClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  flowKey: 'flow-1',
};

const importFresh = async () => {
  vi.resetModules();
  return import('./index.ts');
};

describe('loadSecrets', () => {
  beforeEach(() => {
    ssmMock.reset();
    vi.stubEnv('SECRETS_PARAM', '/fridgeboard/auth/secrets');
  });

  it('reads and decrypts the SSM parameter', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: JSON.stringify(SECRETS) } });
    const { loadSecrets } = await importFresh();

    await expect(loadSecrets()).resolves.toEqual(SECRETS);
    expect(ssmMock.commandCalls(GetParameterCommand)[0]?.args[0].input).toEqual({
      Name: '/fridgeboard/auth/secrets',
      WithDecryption: true,
    });
  });

  it('caches the secrets per container', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: JSON.stringify(SECRETS) } });
    const { loadSecrets } = await importFresh();

    await loadSecrets();
    await loadSecrets();

    expect(ssmMock.commandCalls(GetParameterCommand)).toHaveLength(1);
  });

  it('rejects a parameter missing a field and retries on the next call', async () => {
    ssmMock
      .on(GetParameterCommand)
      .resolvesOnce({ Parameter: { Value: JSON.stringify({ clientId: 'client-1' }) } })
      .resolves({ Parameter: { Value: JSON.stringify(SECRETS) } });
    const { loadSecrets } = await importFresh();

    await expect(loadSecrets()).rejects.toThrow('INVALID_SECRETS');
    await expect(loadSecrets()).resolves.toEqual(SECRETS);
  });
});
