import { PASTED_LABEL } from './constants';
import type { BuildImportLabelOptions } from './types';

export const buildImportLabel = ({ source }: BuildImportLabelOptions): string => {
  try {
    return new URL(source).hostname.replace(/^www\./, '');
  } catch {
    return PASTED_LABEL;
  }
};
