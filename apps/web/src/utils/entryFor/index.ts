// The config holds one `default` entry plus optional entries named after a query or mutation.
export const entryFor = <Entry>(
  entries: Record<string, Entry | undefined>,
  name: unknown,
): Entry | undefined => Object.entries(entries).find(([key]) => key === name)?.[1];
