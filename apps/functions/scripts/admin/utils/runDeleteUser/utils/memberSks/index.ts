import { HOUSEHOLD_PK_PREFIX } from '../../../../../../src/utils/keys/constants.ts';
import { MEMBER_SK_PREFIX } from '../../../../../../src/utils/keys/constants.ts';
import { queryAll } from '../../../queryAll/index.ts';
import { PK_SK_PREFIX_CONDITION } from '../../constants.ts';

export const memberSks = async (householdId: string): Promise<string[]> =>
  (
    await queryAll({
      KeyConditionExpression: PK_SK_PREFIX_CONDITION,
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':sk': MEMBER_SK_PREFIX,
      },
    })
  ).flatMap((item) => (typeof item['SK'] === 'string' ? [item['SK']] : []));
