import type { MutationEntry } from '../../services/configuration/mutations/types';

export const toMutationOptions = ({ retry }: MutationEntry) => ({
  ...(retry === undefined ? {} : { retry }),
});
