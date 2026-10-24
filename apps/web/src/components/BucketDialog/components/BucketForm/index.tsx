import { Button, Input, Label, TextField } from '@heroui/react';
import { BUCKET_NAME_MAX_LENGTH, BucketColor } from '../../../../services/shoppingList/constants';
import type { Bucket } from '../../../../services/shoppingList/types';
import { BucketSwatch } from '../../../BucketSwatch';
import { BUCKET_FORM_COPY } from './constants';
import { useBucketForm } from './hooks/useBucketForm';

type BucketFormProps = { bucket?: Bucket | undefined; onDone: () => void };

export const BucketForm = ({ bucket, onDone }: BucketFormProps) => {
  const { name, setName, color, setColor, isSaving, isDeleting, handleSubmit, handleDelete } =
    useBucketForm(bucket, onDone);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TextField
        isRequired
        autoFocus
        maxLength={BUCKET_NAME_MAX_LENGTH}
        value={name}
        onChange={setName}
      >
        <Label>{BUCKET_FORM_COPY.nameLabel}</Label>
        <Input />
      </TextField>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{BUCKET_FORM_COPY.colorLabel}</span>
        <div role="group" aria-label={BUCKET_FORM_COPY.colorLabel} className="flex flex-wrap gap-3">
          {Object.values(BucketColor).map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option}
              aria-pressed={option === color}
              onClick={() => setColor(option)}
              className="cursor-pointer rounded-full p-1 outline-none transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2"
            >
              <BucketSwatch color={option} size="lg" />
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" fullWidth isPending={isSaving}>
        {bucket === undefined ? BUCKET_FORM_COPY.create : BUCKET_FORM_COPY.save}
      </Button>
      {bucket !== undefined && (
        <Button variant="danger-soft" fullWidth onPress={handleDelete} isPending={isDeleting}>
          {BUCKET_FORM_COPY.delete}
        </Button>
      )}
    </form>
  );
};
