export type Listener<TEvent> = (event: TEvent) => void;

export type SubscribeOptions<TTopic extends string, TEvent> = {
  topic: TTopic;
  listener: Listener<TEvent>;
};

export type EmitOptions<TTopic extends string, TEvent> = { topic: TTopic; event: TEvent };

export type EventBus<TTopic extends string, TEvent> = {
  subscribe: (options: SubscribeOptions<TTopic, TEvent>) => () => void;
  emit: (options: EmitOptions<TTopic, TEvent>) => void;
};
