import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCreateBucketMutation } from '../../../../../../hooks/useCreateBucketMutation';
import { useDeleteBucketMutation } from '../../../../../../hooks/useDeleteBucketMutation';
import { useUpdateBucketMutation } from '../../../../../../hooks/useUpdateBucketMutation';
import { BucketColor } from '../../../../../../services/shoppingList/constants';
import type { Bucket } from '../../../../../../services/shoppingList/types';
import type { BucketFormState } from './types';

export const useBucketForm = (bucket: Bucket | undefined, onDone: () => void): BucketFormState => {
  const [name, setName] = useState(bucket?.name ?? '');
  const [color, setColor] = useState(bucket?.color ?? BucketColor.Mint);
  const create = useCreateBucketMutation();
  const update = useUpdateBucketMutation();
  const remove = useDeleteBucketMutation();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      return;
    }
    if (bucket === undefined) {
      create.mutate({ name: trimmed, color }, { onSuccess: onDone });
    } else {
      update.mutate({ id: bucket.id, changes: { name: trimmed, color } }, { onSuccess: onDone });
    }
  };

  const handleDelete = () => {
    if (bucket !== undefined) {
      remove.mutate(bucket.id, { onSuccess: onDone });
    }
  };

  return {
    name,
    setName,
    color,
    setColor,
    isSaving: create.isPending || update.isPending,
    isDeleting: remove.isPending,
    handleSubmit,
    handleDelete,
  };
};
