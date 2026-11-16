import { Button, Input, Label, TextField, useOverlayState } from '@heroui/react';
import { ColorPicker } from '../../../../../../components/ColorPicker';
import { ConfirmDialog } from '../../../../../../components/ConfirmDialog';
import { useAutoFocus } from '../../../../../../hooks/useAutoFocus';
import { ShopSwatch } from '../../../../../../components/ShopSwatch';
import {
  EVENT_NOTE_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  NO_REMINDER,
  REMINDER_OPTIONS,
} from '../../../../constants';
import { useOwners } from '../../../../hooks/useOwners';
import { EVENT_FORM_COPY, FIELD_CLASS } from './constants';
import { useEventForm } from './hooks/useEventForm';
import type { EventFormProps } from './types';

export const EventForm = ({ event, date, onSave, onDelete, onDone }: EventFormProps) => {
  const owners = useOwners();
  const titleRef = useAutoFocus<HTMLInputElement>();
  const { draft, setField, handleSubmit, handleDelete } = useEventForm({
    event,
    date,
    onSave,
    onDelete,
    onDone,
  });

  const confirmDelete = useOverlayState();

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
      <TextField
        isRequired
        maxLength={EVENT_TITLE_MAX_LENGTH}
        value={draft.title}
        onChange={(value) => setField({ field: 'title', value })}
      >
        <Label>{EVENT_FORM_COPY.titleLabel}</Label>
        <Input ref={titleRef} />
      </TextField>
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-separator px-4 py-2 text-sm font-medium has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus">
        <input
          type="checkbox"
          className="sr-only"
          checked={draft.allDay}
          onChange={(changeEvent) =>
            setField({ field: 'allDay', value: changeEvent.target.checked })
          }
        />
        {EVENT_FORM_COPY.allDayLabel}
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
        {EVENT_FORM_COPY.dateLabel}
        <input
          type="date"
          required
          className={FIELD_CLASS}
          value={draft.date}
          onChange={(changeEvent) => setField({ field: 'date', value: changeEvent.target.value })}
        />
      </label>
      {draft.allDay && (
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          {EVENT_FORM_COPY.lastDayLabel}
          <input
            type="date"
            required
            min={draft.date}
            className={FIELD_CLASS}
            value={draft.endDate ?? draft.date}
            onChange={(changeEvent) =>
              setField({ field: 'endDate', value: changeEvent.target.value })
            }
          />
        </label>
      )}
      {!draft.allDay && (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.startLabel}
            <input
              type="time"
              required
              className={FIELD_CLASS}
              value={draft.startTime}
              onChange={(changeEvent) =>
                setField({ field: 'startTime', value: changeEvent.target.value })
              }
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            {EVENT_FORM_COPY.endLabel}
            <input
              type="time"
              required
              className={FIELD_CLASS}
              value={draft.endTime}
              onChange={(changeEvent) =>
                setField({ field: 'endTime', value: changeEvent.target.value })
              }
            />
          </label>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{EVENT_FORM_COPY.ownerLabel}</span>
        <div
          role="radiogroup"
          aria-label={EVENT_FORM_COPY.ownerLabel}
          className="flex flex-wrap gap-2"
        >
          {owners.map((member) => (
            <label
              key={member.id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-separator px-3 py-2 text-sm font-medium has-[:checked]:border-foreground has-[:checked]:bg-default has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus"
            >
              <input
                type="radio"
                name="owner"
                className="sr-only"
                value={member.id}
                checked={draft.ownerId === member.id}
                onChange={() => setField({ field: 'ownerId', value: member.id })}
              />
              <ShopSwatch color={member.color} size="sm" />
              {member.name}
            </label>
          ))}
        </div>
      </div>
      <ColorPicker
        label={EVENT_FORM_COPY.colorLabel}
        noneLabel={EVENT_FORM_COPY.defaultColor}
        value={draft.color}
        onChange={(color) => setField({ field: 'color', value: color })}
      />
      <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
        {EVENT_FORM_COPY.reminderLabel}
        <select
          className={FIELD_CLASS}
          value={draft.reminder === undefined ? NO_REMINDER : String(draft.reminder)}
          onChange={(changeEvent) =>
            setField({
              field: 'reminder',
              value:
                changeEvent.target.value === NO_REMINDER
                  ? undefined
                  : Number(changeEvent.target.value),
            })
          }
        >
          {REMINDER_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <TextField
        maxLength={EVENT_NOTE_MAX_LENGTH}
        value={draft.note}
        onChange={(value) => setField({ field: 'note', value })}
      >
        <Label>{EVENT_FORM_COPY.noteLabel}</Label>
        <Input />
      </TextField>
      <Button type="submit" fullWidth>
        {event === undefined ? EVENT_FORM_COPY.create : EVENT_FORM_COPY.save}
      </Button>
      {event !== undefined && (
        <>
          <Button variant="danger-soft" fullWidth onPress={confirmDelete.open}>
            {EVENT_FORM_COPY.delete}
          </Button>
          <ConfirmDialog
            state={confirmDelete}
            title={EVENT_FORM_COPY.confirmTitle(event.title)}
            description={EVENT_FORM_COPY.confirmDescription}
            confirmLabel={EVENT_FORM_COPY.confirm}
            onConfirm={handleDelete}
          />
        </>
      )}
    </form>
  );
};
