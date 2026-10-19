export const stripUnknownFlags = (raw: unknown, known: readonly string[]): unknown => {
  if (typeof raw !== 'object' || raw === null || !('featureFlags' in raw)) {
    return raw;
  }
  const { featureFlags } = raw;
  if (typeof featureFlags !== 'object' || featureFlags === null || Array.isArray(featureFlags)) {
    return raw;
  }
  return {
    ...raw,
    featureFlags: Object.fromEntries(
      Object.entries(featureFlags).filter(([name]) => known.includes(name)),
    ),
  };
};
