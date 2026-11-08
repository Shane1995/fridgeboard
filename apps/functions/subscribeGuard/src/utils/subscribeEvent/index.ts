import * as z from 'zod/mini';

export const SubscribeEventSchema = z.object({
  identity: z.object({ sub: z.string() }),
  info: z.object({ channel: z.object({ segments: z.array(z.string()) }) }),
});
