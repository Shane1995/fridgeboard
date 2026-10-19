const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const stripUnknownEntryKeys = (
  raw: unknown,
  section: string,
  known: readonly string[],
): unknown => {
  if (!isRecord(raw) || !isRecord(raw[section])) {
    return raw;
  }
  return {
    ...raw,
    [section]: Object.fromEntries(
      Object.entries(raw[section]).map(([name, entry]) => [
        name,
        isRecord(entry)
          ? Object.fromEntries(Object.entries(entry).filter(([key]) => known.includes(key)))
          : entry,
      ]),
    ),
  };
};
