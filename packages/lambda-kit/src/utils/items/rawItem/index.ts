import * as z from 'zod/mini';

// Any item, unchecked. For tools that must act on whatever is stored, such as deleting a user.
export const RawItemSchema = z.looseObject({});
