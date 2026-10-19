export const mergeSettings = <Key extends string>(
  defaults: Record<Key, number>,
  served: Partial<Record<Key, number | undefined>> | undefined,
): Record<Key, number> => ({
  ...defaults,
  ...Object.fromEntries(Object.entries(served ?? {}).filter(([, value]) => value !== undefined)),
});
