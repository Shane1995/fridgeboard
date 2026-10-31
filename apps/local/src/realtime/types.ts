export type Subscriber = {
  id: string;
  send: (message: Record<string, unknown>) => void;
};

export type RealtimeHub = {
  subscribe: (options: { channel: string; subscriber: Subscriber }) => () => void;
  publish: (options: { channel: string; events: readonly string[] }) => number;
};
