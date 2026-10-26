import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const subscribe = ({ sub = 'sub-1', segments = ['hh', 'hh-1'] } = {}) => ({
  identity: { sub },
  info: { channel: { path: `/${segments.join('/')}`, segments } },
});

describe('subscribeGuard handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('lets a member subscribe to their household channel', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { GSI1SK: 'HH#hh-1', role: 'member' } });

    expect(await handler(subscribe())).toBeNull();
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
    });
  });

  it('refuses someone who is not a member', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await handler(subscribe())).toEqual({ error: 'unauthorized' });
  });

  it.each([
    ['another namespace', ['other', 'hh-1']],
    ['a channel with extra segments', ['hh', 'hh-1', 'more']],
    ['the namespace alone', ['hh']],
    ['a household id that is not an id', ['hh', '../x']],
  ])('refuses %s without reading the table', async (_name, segments) => {
    expect(await handler(subscribe({ segments }))).toEqual({ error: 'unauthorized' });
    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
  });

  it.each([[undefined], [{}], [{ identity: {}, info: {} }], ['text']])(
    'refuses an event it does not recognise: %j',
    async (event) => {
      expect(await handler(event)).toEqual({ error: 'unauthorized' });
      expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
    },
  );
});
