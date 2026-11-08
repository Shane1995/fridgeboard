export const stripTopLevelParams = (raw: unknown): unknown => {
  if (typeof raw !== 'object' || raw === null || !('params' in raw)) {
    return raw;
  }
  const { params: _params, ...rest } = raw;
  return rest;
};
