import { ParameterAlreadyExists, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { putParameters } from './index.ts';

const ssmMock = mockClient(SSMClient);

describe('putParameters', () => {
  beforeEach(() => {
    ssmMock.reset();
  });

  it('stores a placeholder Tavily key without overwriting', async () => {
    ssmMock.on(PutParameterCommand).resolves({});

    await putParameters({ ssm: new SSMClient({}) });

    expect(ssmMock.commandCalls(PutParameterCommand)[0]?.args[0].input).toEqual({
      Name: '/fridgeboard/tavily-api-key',
      Value: 'local-placeholder',
      Type: 'SecureString',
    });
  });

  it('keeps an existing value', async () => {
    ssmMock
      .on(PutParameterCommand)
      .rejects(new ParameterAlreadyExists({ message: 'exists', $metadata: {} }));

    await expect(putParameters({ ssm: new SSMClient({}) })).resolves.toBeUndefined();
  });

  it('rethrows other errors', async () => {
    ssmMock.on(PutParameterCommand).rejects(new Error('boom'));

    await expect(putParameters({ ssm: new SSMClient({}) })).rejects.toThrow('boom');
  });
});
