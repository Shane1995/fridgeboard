import { AppDialog } from '../../../../components/AppDialog';
import { Button } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { FORM_INPUT_CLASS } from '../RecipeForm/constants';
import { IMPORT_DIALOG_COPY } from './constants';
import { useImportForm } from './hooks/useImportForm';
import type { ImportDialogProps } from './types';

export const ImportDialog = ({ state, onImport }: ImportDialogProps) => {
  const { source, error, handleChange, handleSubmit } = useImportForm({
    onImport,
    onDone: state.close,
  });
  return (
    <AppDialog state={state} title={IMPORT_DIALOG_COPY.title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {IMPORT_DIALOG_COPY.label}
          <textarea
            rows={4}
            className={FORM_INPUT_CLASS}
            placeholder={IMPORT_DIALOG_COPY.placeholder}
            value={source}
            onChange={(event) => handleChange({ value: event.target.value })}
          />
        </label>
        {error !== undefined && (
          <Typography variant={TypographyVariant.Caption}>{error}</Typography>
        )}
        <Typography variant={TypographyVariant.Caption}>{IMPORT_DIALOG_COPY.hint}</Typography>
        <Button type="submit" variant="primary" fullWidth>
          {IMPORT_DIALOG_COPY.submit}
        </Button>
      </form>
    </AppDialog>
  );
};
