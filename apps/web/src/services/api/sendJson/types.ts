export type ApiResult<TData, TReason extends string> =
  | { ok: true; data: TData }
  | { ok: false; reason: TReason | 'unknown' };
