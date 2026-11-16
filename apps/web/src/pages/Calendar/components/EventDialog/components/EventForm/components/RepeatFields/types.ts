import type { RepeatDraft } from '../../../../../../types';

export type RepeatFieldsProps = {
  date: string;
  value: RepeatDraft | undefined;
  onChange: (value: RepeatDraft | undefined) => void;
};
