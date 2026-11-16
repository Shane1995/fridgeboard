import { queryEvents } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { queryRules } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { addDays } from '@fridgeboard/lambda-kit/utils/addDays/index.ts';
import { compareEvents } from '@fridgeboard/lambda-kit/utils/compareEvents/index.ts';
import { expandRule } from '@fridgeboard/lambda-kit/utils/expandRule/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { readWindow } from '../../utils/readWindow/index.ts';

// One-off events plus the occurrences of the household's rules, in one list. Occurrences are
// expanded from a day early so an overnight one that began before the window still shows.
export const listEvents = async ({ user, table, scope }: HouseholdRouteContext) => {
  const window = readWindow({ query: user.event.queryStringParameters });
  if (window === undefined) {
    return jsonResponse(400, { reason: 'invalid-window' });
  }
  const [events, rules] = await Promise.all([
    queryEvents({ table, scope, ...window }),
    queryRules({ table, scope }),
  ]);
  const occurrences = rules
    .flatMap((rule) =>
      expandRule({ rule, from: addDays({ date: window.from, days: -1 }), to: window.to }),
    )
    .filter(({ endDate }) => endDate >= window.from);
  return jsonResponse(200, { events: [...events, ...occurrences].sort(compareEvents) });
};
