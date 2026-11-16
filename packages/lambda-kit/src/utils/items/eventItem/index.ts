import * as z from 'zod/mini';

// HH#<id> / EVENT#<startDate>#<eventId>
export const EventItemSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  note: z.string(),
  ownerId: z.string(),
  eventType: z.string(),
  allDay: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  startsAt: z.optional(z.string()),
  endsAt: z.optional(z.string()),
  color: z.optional(z.string()),
  reminder: z.optional(z.number()),
});
