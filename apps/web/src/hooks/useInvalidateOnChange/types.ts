import type { ChangeType } from '@fridgeboard/contract/changes';
import type { QueryName } from '../../services/configuration/schema/constants';

export type UseInvalidateOnChangeOptions = {
  types: readonly ChangeType[];
  keys: readonly QueryName[];
};
