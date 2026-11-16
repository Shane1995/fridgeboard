import * as z from 'zod/mini';

// HH#<id> / RULE#<ruleId>
export const RuleItemSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  note: z.string(),
  ownerId: z.string(),
  allDay: z.boolean(),
  startDate: z.string(),
  frequency: z.string(),
  interval: z.number(),
  skip: z.array(z.string()),
  weekdays: z.optional(z.array(z.number())),
  until: z.optional(z.string()),
  startTime: z.optional(z.string()),
  endTime: z.optional(z.string()),
  color: z.optional(z.string()),
  reminder: z.optional(z.number()),
});
