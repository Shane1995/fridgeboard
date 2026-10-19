import type { MutationEntry } from '@fridgeboard/contract/configuration/mutations/types';

export const toMutationOptions = ({ retry }: MutationEntry) => ({
  ...(retry === undefined ? {} : { retry }),
});
