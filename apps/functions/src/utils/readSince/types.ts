export type ReadSinceOptions = { value: string | undefined };

export type SinceResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'ok'; since: number };
