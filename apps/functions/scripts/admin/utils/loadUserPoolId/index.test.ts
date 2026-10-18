import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { loadUserPoolId } from './index.ts';

const ssmMock = mockClient(SSMClient);

describe('loadUserPoolId', () => {
  beforeEach(() => ssmMock.reset());

  it('returns only the user pool id', async () => {
    ssmMock
      .on(GetParameterCommand)
      .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'p1', clientSecret: 's' }) } });
    await expect(loadUserPoolId()).resolves.toBe('p1');
  });

  it('throws a constant error without echoing unparseable secret content', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: 'clientSecret-oops{' } });
    const error = await loadUserPoolId().catch((caught: Error) => caught);
    expect(error).toEqual(new Error('SSM secrets parameter is invalid'));
  });

  it('throws the same constant error when userPoolId is missing', async () => {
    ssmMock.on(GetParameterCommand).resolves({ Parameter: { Value: '{}' } });
    await expect(loadUserPoolId()).rejects.toThrow('SSM secrets parameter is invalid');
  });
});
