import { Button } from '@heroui/react';
import { Loader2 } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { IMPORTS_TRAY_COPY } from './constants';
import type { ImportsTrayProps } from './types';

export const ImportsTray = ({ imports, onReview, onRetry, onDiscard }: ImportsTrayProps) => {
  if (imports.length === 0) {
    return null;
  }
  return (
    <section aria-label={IMPORTS_TRAY_COPY.heading} className="flex flex-col gap-2">
      <Typography variant={TypographyVariant.Heading3} as="h2">
        {IMPORTS_TRAY_COPY.heading}
      </Typography>
      <ul className="flex flex-col gap-2">
        {imports.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm"
          >
            <span className="flex min-w-0 flex-col">
              {item.status === 'parsing' && (
                <span className="flex items-center gap-2">
                  <Loader2 aria-hidden size={16} className="animate-spin" />
                  {IMPORTS_TRAY_COPY.parsing} {item.label}
                </span>
              )}
              {item.status === 'ready' && (
                <span className="truncate font-semibold">
                  {IMPORTS_TRAY_COPY.imported} {item.draft?.name}
                </span>
              )}
              {item.status === 'failed' && (
                <>
                  <span className="truncate font-semibold">{item.label}</span>
                  <span className="text-xs opacity-70">{item.reason}</span>
                </>
              )}
            </span>
            <span className="flex gap-1">
              {item.status === 'ready' && (
                <Button size="sm" variant="primary" onPress={() => onReview({ id: item.id })}>
                  {IMPORTS_TRAY_COPY.review}
                </Button>
              )}
              {item.status === 'failed' && (
                <Button size="sm" variant="secondary" onPress={() => onRetry({ id: item.id })}>
                  {IMPORTS_TRAY_COPY.retry}
                </Button>
              )}
              {item.status !== 'parsing' && (
                <Button size="sm" variant="ghost" onPress={() => onDiscard({ id: item.id })}>
                  {IMPORTS_TRAY_COPY.discard}
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Typography variant={TypographyVariant.Caption}>{IMPORTS_TRAY_COPY.hint}</Typography>
    </section>
  );
};
