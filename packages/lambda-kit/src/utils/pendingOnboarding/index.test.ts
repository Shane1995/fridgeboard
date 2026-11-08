import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { OnboardingSectionId } from '../buildOnboarding/constants.ts';
import { HouseholdRole } from '../isHouseholdRole/constants.ts';
import { createTable } from '../table/index.ts';
import { pendingOnboarding } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');
const profile = {
  email: 'a@x.com',
  username: null,
  canCreateHousehold: true,
  skippedSections: [],
};

describe('pendingOnboarding', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('asks for a household when the user has no membership', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    expect(await pendingOnboarding(table, { sub: 's', profile, isAdmin: false })).toEqual([
      { id: OnboardingSectionId.Username, skippable: false },
      { id: OnboardingSectionId.Household, skippable: true },
    ]);
  });

  it('does not ask for a household once the user has a membership', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Member }],
    });

    expect(await pendingOnboarding(table, { sub: 's', profile, isAdmin: false })).toEqual([
      { id: OnboardingSectionId.Username, skippable: false },
    ]);
  });

  it('leaves out a skipped household section', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    expect(
      await pendingOnboarding(table, {
        sub: 's',
        profile: { ...profile, username: 'jess', skippedSections: [OnboardingSectionId.Household] },
        isAdmin: false,
      }),
    ).toEqual([]);
  });
});
