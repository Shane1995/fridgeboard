import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../../utils/table/index.ts';
import { createProfile, getProfile, saveSkippedSections } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');

describe('getProfile', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns undefined when there is no profile', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await getProfile(table, 'sub-1')).toBeUndefined();
  });

  it('maps the stored item and defaults the optional fields', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { email: 'jess@example.com' } });

    expect(await getProfile(table, 'sub-1')).toEqual({
      email: 'jess@example.com',
      username: null,
      canCreateHousehold: false,
      skippedSections: [],
    });
  });

  it('reads the skipped sections', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { email: 'a@x.com', skippedSections: ['household'] } });

    expect(await getProfile(table, 'sub-1')).toMatchObject({ skippedSections: ['household'] });
  });

  it('reads the username and flag and asks for a consistent read', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { email: 'a@x.com', username: 'jess', canCreateHousehold: true } });

    expect(await getProfile(table, 'sub-1')).toMatchObject({
      username: 'jess',
      canCreateHousehold: true,
    });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toMatchObject({
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConsistentRead: true,
    });
  });
});

describe('saveSkippedSections', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('stores the skipped sections on the profile and returns it', async () => {
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { email: 'jess@example.com', skippedSections: ['username'] },
    });

    const saved = await saveSkippedSections({
      table,
      sub: 'sub-1',
      skippedSections: ['username'],
    });

    expect(saved).toMatchObject({ skippedSections: ['username'] });
    expect(ddbMock.commandCalls(UpdateCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
    });
  });

  it('is undefined when the profile does not exist', async () => {
    ddbMock
      .on(UpdateCommand)
      .rejects(new ConditionalCheckFailedException({ message: 'missing', $metadata: {} }));

    expect(
      await saveSkippedSections({ table, sub: 'sub-1', skippedSections: ['username'] }),
    ).toBeUndefined();
  });
});

describe('createProfile', () => {
  const options = {
    client,
    sub: 'sub-1',
    email: 'jess@example.com',
    canCreateHousehold: true,
    now: '2026-11-15T00:00:00.000Z',
  };

  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('creates the profile unless one exists and says so', async () => {
    ddbMock.on(PutCommand).resolves({});

    expect(await createProfile(options)).toBe(true);
    expect(ddbMock.commandCalls(PutCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Item: {
        PK: 'USER#sub-1',
        SK: 'PROFILE',
        email: 'jess@example.com',
        createdAt: '2026-11-15T00:00:00.000Z',
        canCreateHousehold: true,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
  });

  it('leaves an existing profile alone and says so', async () => {
    ddbMock
      .on(PutCommand)
      .rejects(new ConditionalCheckFailedException({ message: 'exists', $metadata: {} }));

    expect(await createProfile(options)).toBe(false);
  });

  it('rethrows any other failure', async () => {
    ddbMock.on(PutCommand).rejects(new Error('boom'));

    await expect(createProfile(options)).rejects.toThrow('boom');
  });
});
