import type { ChangeType } from '@fridgeboard/contract/changes';
import type { ChangeEvent } from '../../services/realtime/types';

export type UseOnChangeOptions = {
  types: readonly ChangeType[];
  onChange: (event: ChangeEvent) => void;
};
