import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { runExportUser } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cognitoMock = mockClient(CognitoIdentityProviderClient);
const ssmMock = mockClient(SSMClient);

describe('runExportUser', () => {
  const directory = mkdtemp(join(tmpdir(), 'export-test-'));

  afterAll(async () => rm(await directory, { recursive: true, force: true }));

  beforeEach(() => {
    ddbMock.reset();
    cognitoMock.reset();
    ssmMock.reset();
    ssmMock
      .on(GetParameterCommand)
      .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
    cognitoMock
      .on(AdminGetUserCommand)
      .resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });
  });

  it('writes the profile and memberships with household META to export-<sub>.json', async () => {
    ddbMock
      .on(GetCommand, { Key: { PK: 'USER#u1', SK: 'PROFILE' } })
      .resolves({ Item: { PK: 'USER#u1', SK: 'PROFILE', name: 'Jess' } })
      .on(GetCommand, { Key: { PK: 'HH#h1', SK: 'META' } })
      .resolves({ Item: { PK: 'HH#h1', SK: 'META', name: 'Home' } })
      .on(QueryCommand)
      .resolves({ Items: [{ PK: 'HH#h1', SK: 'MEMBER#u1', role: 'admin' }] });

    const dir = await directory;
    const path = await runExportUser('Jess@Example.com', dir);

    expect(path).toBe(join(dir, 'export-u1.json'));
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({
      sub: 'u1',
      profile: { PK: 'USER#u1', SK: 'PROFILE', name: 'Jess' },
      memberships: [
        {
          membership: { PK: 'HH#h1', SK: 'MEMBER#u1', role: 'admin' },
          household: { PK: 'HH#h1', SK: 'META', name: 'Home' },
        },
      ],
    });
  });

  it('refuses to overwrite an existing export file', async () => {
    ddbMock.on(GetCommand).resolves({}).on(QueryCommand).resolves({ Items: [] });
    const dir = await directory;
    await writeFile(join(dir, 'export-u1.json'), 'old');

    await expect(runExportUser('Jess@Example.com', dir)).rejects.toThrow('already exists');
    expect(await readFile(join(dir, 'export-u1.json'), 'utf8')).toBe('old');
  });
});
