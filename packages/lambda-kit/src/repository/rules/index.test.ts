import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import type { IEventRule } from '@fridgeboard/contract/events';
import { createTable } from '../../utils/table/index.ts';
import { deleteRuleOp, getRule, putRuleOp, queryRules } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1' };

const row = (id: string, startDate: string) => ({
  PK: 'HH#hh-1',
  SK: `RULE#${id}`,
  id,
  title: `Rule ${id}`,
  note: '',
  ownerId: 'household',
  allDay: true,
  startDate,
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  skip: ['2026-11-19'],
  color: 'black',
  reminder: 360,
});

describe('queryRules', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the household’s rules by prefix, oldest start first', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [row('b', '2026-12-01'), row('a', '2026-11-05')],
    });

    const rules = await queryRules({ table, scope });

    expect(rules.map(({ id }) => id)).toEqual(['a', 'b']);
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': 'HH#hh-1', ':prefix': 'RULE#' },
    });
  });

  it('maps an all-day rule with its repeat, skips, colour and reminder', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('a', '2026-11-05')] });

    expect(await queryRules({ table, scope })).toEqual([
      {
        id: 'a',
        title: 'Rule a',
        note: '',
        ownerId: 'household',
        allDay: true,
        startDate: '2026-11-05',
        frequency: 'weekly',
        interval: 2,
        weekdays: [4],
        skip: ['2026-11-19'],
        color: 'black',
        reminder: 360,
      },
    ]);
  });

  it('maps a timed rule with its times', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ ...row('t', '2026-11-05'), allDay: false, startTime: '18:00', endTime: '02:00' }],
    });

    expect(await queryRules({ table, scope })).toMatchObject([
      { allDay: false, startTime: '18:00', endTime: '02:00' },
    ]);
  });
});

describe('getRule', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads a rule by its id', async () => {
    ddbMock.on(GetCommand).resolves({ Item: row('a', '2026-11-05') });

    expect(await getRule({ table, scope, ruleId: 'a' })).toMatchObject({ id: 'a' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'RULE#a',
    });
  });

  it('is undefined when there is no such rule', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await getRule({ table, scope, ruleId: 'x' })).toBeUndefined();
  });
});

describe('rule writes', () => {
  const rule: IEventRule = {
    id: 'a',
    title: 'Recycling',
    note: '',
    ownerId: 'household',
    allDay: true,
    startDate: '2026-11-12',
    frequency: 'weekly',
    interval: 2,
    weekdays: [4],
    skip: [],
  };

  it('puts a rule under its own key', () => {
    expect(putRuleOp({ scope, rule })).toEqual({
      put: { PK: 'HH#hh-1', SK: 'RULE#a', ...rule },
    });
  });

  it('deletes a rule by its key', () => {
    expect(deleteRuleOp({ scope, ruleId: 'a' })).toEqual({
      delete: { PK: 'HH#hh-1', SK: 'RULE#a' },
    });
  });
});
