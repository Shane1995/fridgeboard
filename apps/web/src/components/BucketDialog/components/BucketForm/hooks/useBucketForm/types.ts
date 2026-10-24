import type { FormEvent } from 'react';
import type { BucketColor } from '../../../../../../services/shoppingList/constants';

export type BucketFormState = {
  name: string;
  setName: (name: string) => void;
  color: BucketColor;
  setColor: (color: BucketColor) => void;
  isSaving: boolean;
  isDeleting: boolean;
  handleDelete: () => void;
  handleSubmit: (event: FormEvent) => void;
};
