export type CoalescerOptions = {
  delayMs: number;
  flush: (items: readonly string[]) => void;
};

export type Coalescer = { add: (items: readonly string[]) => void; cancel: () => void };
