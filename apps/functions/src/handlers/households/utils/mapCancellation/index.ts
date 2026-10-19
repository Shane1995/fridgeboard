import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { CONDITION_FAILED, GUARD_REASON_INDEX, PROFILE_REASON_INDEX } from '../../constants.ts';

export const mapCancellation = (error: unknown): APIGatewayProxyStructuredResultV2 | undefined => {
  if (!(error instanceof TransactionCanceledException)) {
    return undefined;
  }
  const reasons = error.CancellationReasons ?? [];
  if (reasons[PROFILE_REASON_INDEX]?.Code === CONDITION_FAILED) {
    return jsonResponse(403, { reason: 'not-allowed' });
  }
  if (reasons[GUARD_REASON_INDEX]?.Code === CONDITION_FAILED) {
    return jsonResponse(409, { reason: 'household-exists' });
  }
  return undefined;
};
