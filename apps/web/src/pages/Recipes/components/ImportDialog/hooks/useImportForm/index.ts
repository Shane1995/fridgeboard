import { useState } from 'react';
import type { FormEvent } from 'react';
import { IMPORT_DIALOG_COPY } from '../../constants';
import type { UseImportFormOptions } from './types';

const INSECURE_LINK_PATTERN = /^http:\/\//i;

export const useImportForm = ({ onImport, onDone }: UseImportFormOptions) => {
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = ({ value }: { value: string }) => {
    setSource(value);
    setError(undefined);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = source.trim();
    if (trimmed === '') {
      return;
    }
    if (INSECURE_LINK_PATTERN.test(trimmed)) {
      setError(IMPORT_DIALOG_COPY.httpsOnly);
      return;
    }
    onImport({ source: trimmed });
    onDone();
  };

  return { source, error, handleChange, handleSubmit };
};
