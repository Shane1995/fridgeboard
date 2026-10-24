import { Button } from '@heroui/react';
import { CONFIGURATION_ERROR_COPY } from './constants';
import type { ConfigurationErrorProps } from './types';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';

export const ConfigurationError = ({ onRetry }: ConfigurationErrorProps) => (
  <main
    role="alert"
    className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
  >
    <Typography variant={TypographyVariant.Heading2} as="h1">
      {CONFIGURATION_ERROR_COPY.title}
    </Typography>
    <Typography>{CONFIGURATION_ERROR_COPY.body}</Typography>
    <Button onPress={onRetry}>{CONFIGURATION_ERROR_COPY.retry}</Button>
  </main>
);
