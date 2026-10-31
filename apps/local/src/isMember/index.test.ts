import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { encodeToken } from '../encodeToken/index.ts';
import { claimsFor } from '../claimsFor/index.ts';
import { isMember } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const token = encodeToken(claimsFor('admin@fridgeboard.local'));

describe('isMember', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('accepts a household member', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'p' } });

    expect(await isMember({ token, channel: '/hh/local-household' })).toBe(true);
  });

  it('rejects a user without a membership', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await isMember({ token, channel: '/hh/local-household' })).toBe(false);
  });

  it('rejects a missing or invalid token without reading the table', async () => {
    expect(await isMember({ token: undefined, channel: '/hh/local-household' })).toBe(false);
    expect(await isMember({ token: 'nope', channel: '/hh/local-household' })).toBe(false);
    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
  });

  it('rejects a channel outside the household namespace', async () => {
    expect(await isMember({ token, channel: '/other/local-household' })).toBe(false);
    expect(await isMember({ token, channel: '/hh/a/b' })).toBe(false);
  });
});
