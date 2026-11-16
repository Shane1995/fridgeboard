import { EVENT_FORM_COPY, EVERY_MAX, FIELD_CLASS, REPEAT_OPTIONS, WEEKDAYS } from '../../constants';
import type { RepeatFieldsProps } from './types';
import { toggleWeekday } from './utils/toggleWeekday';
import { weekdayOf } from './utils/weekdayOf';

const CHIP_CLASS =
  'inline-flex cursor-pointer items-center rounded-full border border-separator px-4 py-2 text-sm font-medium has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus';

const UNIT = { daily: 'day(s)', weekly: 'week(s)', monthly: 'month(s)' } as const;

// How an event repeats: never, or daily, weekly or monthly every N, optionally until a date. A
// weekly series starts on the weekday of its first day and can add more.
export const RepeatFields = ({ date, value, onChange }: RepeatFieldsProps) => {
  const choose = (choice: (typeof REPEAT_OPTIONS)[number]['value']) => {
    if (choice === 'never') {
      onChange(undefined);
      return;
    }
    onChange({
      frequency: choice,
      interval: value?.interval ?? 1,
      weekdays:
        value !== undefined && value.weekdays.length > 0 ? value.weekdays : [weekdayOf({ date })],
      ...(value?.until === undefined ? {} : { until: value.until }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">{EVENT_FORM_COPY.repeatLabel}</span>
      <div
        role="radiogroup"
        aria-label={EVENT_FORM_COPY.repeatLabel}
        className="flex flex-wrap gap-2"
      >
        {REPEAT_OPTIONS.map(({ value: option, label }) => (
          <label key={option} className={CHIP_CLASS}>
            <input
              type="radio"
              name="repeat"
              className="sr-only"
              checked={(value?.frequency ?? 'never') === option}
              onChange={() => choose(option)}
            />
            {label}
          </label>
        ))}
      </div>
      {value !== undefined && (
        <>
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.everyLabel} ({UNIT[value.frequency]})
            <input
              type="number"
              min={1}
              max={EVERY_MAX}
              className={FIELD_CLASS}
              value={value.interval}
              onChange={(changeEvent) =>
                onChange({
                  ...value,
                  interval: Math.min(EVERY_MAX, Math.max(1, Number(changeEvent.target.value) || 1)),
                })
              }
            />
          </label>
          {value.frequency === 'weekly' && (
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ value: day, short, name }) => (
                <button
                  key={day}
                  type="button"
                  aria-label={name}
                  aria-pressed={value.weekdays.includes(day)}
                  onClick={() =>
                    onChange({
                      ...value,
                      weekdays: toggleWeekday({ weekdays: value.weekdays, day }),
                    })
                  }
                  className="size-10 cursor-pointer rounded-full border border-separator text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent"
                >
                  {short}
                </button>
              ))}
            </div>
          )}
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.untilLabel}
            <input
              type="date"
              min={date}
              className={FIELD_CLASS}
              value={value.until ?? ''}
              onChange={(changeEvent) => {
                const { until: _until, ...rest } = value;
                onChange(
                  changeEvent.target.value === ''
                    ? rest
                    : { ...rest, until: changeEvent.target.value },
                );
              }}
            />
          </label>
        </>
      )}
    </div>
  );
};
