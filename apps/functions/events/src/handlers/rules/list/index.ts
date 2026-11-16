import { queryRules } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';

export const listRules = async ({ table, scope }: HouseholdRouteContext) =>
  jsonResponse(200, { rules: await queryRules({ table, scope }) });
