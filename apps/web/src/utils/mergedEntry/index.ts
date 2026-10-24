import { entryFor } from '../entryFor';

// The settings for one query or mutation: the configuration's `default` entry, overridden by the
// entry named after it. This is the only place that layering is decided.
export const mergedEntry = <Default extends object, Entry extends object>(
  entries: { default: Default } & Record<string, Entry | undefined>,
  name: unknown,
) => ({ ...entries.default, ...entryFor(entries, name) });
