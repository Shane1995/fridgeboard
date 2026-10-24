import type { MutationEntry } from '../../services/configuration/schema/types';

export const toMutationOptions = ({ retry }: MutationEntry) => ({
  ...(retry === undefined ? {} : { retry }),
});
