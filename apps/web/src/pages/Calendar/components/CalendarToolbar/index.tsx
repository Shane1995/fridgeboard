import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { CALENDAR_COPY, CalendarView } from '../../constants';
import type { CalendarToolbarProps } from './types';

const VIEW_OPTIONS = [
  { view: CalendarView.Month, label: CALENDAR_COPY.month },
  { view: CalendarView.Week, label: CALENDAR_COPY.week },
] as const;

export const CalendarToolbar = ({
  title,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onAdd,
}: CalendarToolbarProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            variant="ghost"
            aria-label={CALENDAR_COPY.previous}
            onPress={onPrevious}
          >
            <ChevronLeft aria-hidden size={20} />
          </Button>
          <Typography variant={TypographyVariant.Heading3} as="h2" className="min-w-36 text-center">
            {title}
          </Typography>
          <Button isIconOnly variant="ghost" aria-label={CALENDAR_COPY.next} onPress={onNext}>
            <ChevronRight aria-hidden size={20} />
          </Button>
        </div>
        <Button variant="secondary" onPress={onToday}>
          {CALENDAR_COPY.today}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div role="group" aria-label={CALENDAR_COPY.viewLabel} className="flex gap-1">
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.view}
              variant={option.view === view ? 'primary' : 'ghost'}
              aria-pressed={option.view === view}
              onPress={() => onViewChange(option.view)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button variant="primary" onPress={onAdd}>
          <Plus aria-hidden size={18} />
          {CALENDAR_COPY.addEvent}
        </Button>
      </div>
    </div>
  );
};
