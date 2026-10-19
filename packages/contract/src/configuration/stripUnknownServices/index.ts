export const stripUnknownServices = (raw: unknown, known: readonly string[]): unknown => {
  if (typeof raw !== 'object' || raw === null || !('services' in raw)) {
    return raw;
  }
  const { services } = raw;
  if (typeof services !== 'object' || services === null || Array.isArray(services)) {
    return raw;
  }
  return {
    ...raw,
    services: Object.fromEntries(Object.entries(services).filter(([name]) => known.includes(name))),
  };
};
