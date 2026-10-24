import type { FailureReason } from '../../session/constants';

export type ApiResult<TData, TReason extends string> =
  | { ok: true; data: TData }
  | { ok: false; reason: TReason | FailureReason.Unknown };
