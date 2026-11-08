export const stripUnknownKeys = (
  raw: unknown,
  section: string,
  known: readonly string[],
): unknown => {
  if (typeof raw !== 'object' || raw === null || !(section in raw)) {
    return raw;
  }
  const value: unknown = Reflect.get(raw, section);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return raw;
  }
  return {
    ...raw,
    [section]: Object.fromEntries(Object.entries(value).filter(([name]) => known.includes(name))),
  };
};
