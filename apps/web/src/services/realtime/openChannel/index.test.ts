import { openChannel } from '.';

class FakeSocket {
  static last: FakeSocket | undefined;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  sent: string[] = [];
  closed = false;

  constructor(
    readonly url: string,
    readonly protocols: string[],
  ) {
    FakeSocket.last = this;
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
    this.onclose?.();
  }

  receive(message: unknown): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

const open = () => {
  const handlers = { onSubscribed: vi.fn(), onChange: vi.fn(), onClosed: vi.fn() };
  const channel = openChannel({
    realtimeHost: 'abc.appsync-realtime-api.eu-west-2.amazonaws.com',
    httpHost: 'abc.appsync-api.eu-west-2.amazonaws.com',
    token: 'token-1',
    channel: '/hh/hh-1',
    ...handlers,
  });
  const socket = FakeSocket.last;
  if (socket === undefined) {
    throw new Error('no socket was opened');
  }
  return { channel, socket, ...handlers };
};

describe('openChannel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', FakeSocket);
    FakeSocket.last = undefined;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('connects to the realtime host with the subprotocol and the token header', () => {
    const { socket } = open();

    expect(socket.url).toBe(
      'wss://abc.appsync-realtime-api.eu-west-2.amazonaws.com/event/realtime',
    );
    expect(socket.protocols[0]).toBe('aws-appsync-event-ws');
    expect(socket.protocols[1]).toMatch(/^header-[A-Za-z0-9_-]+$/);
  });

  it('initialises the connection, then subscribes once it is acknowledged', () => {
    const { socket } = open();

    socket.onopen?.();
    expect(JSON.parse(socket.sent[0] ?? '')).toEqual({ type: 'connection_init' });

    socket.receive({ type: 'connection_ack', connectionTimeoutMs: 60000 });
    expect(JSON.parse(socket.sent[1] ?? '')).toEqual({
      type: 'subscribe',
      id: 'household',
      channel: '/hh/hh-1',
      authorization: { Authorization: 'token-1' },
    });
  });

  it('reports when the subscription is accepted and passes on each change', () => {
    const { socket, onSubscribed, onChange } = open();

    socket.receive({ type: 'subscribe_success' });
    socket.receive({ type: 'data', event: JSON.stringify({ rev: 4, type: 'shop', id: 's1' }) });
    socket.receive({ type: 'data', event: 'garbage' });

    expect(onSubscribed).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ rev: 4, type: 'shop', id: 's1' });
  });

  it.each(['subscribe_error', 'error'])('closes the socket on a %s message', (type) => {
    const { socket, onClosed } = open();

    socket.receive({ type });

    expect(socket.closed).toBe(true);
    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('closes when no keep-alive arrives within the timeout from the server', () => {
    const { socket, onClosed } = open();
    socket.receive({ type: 'connection_ack', connectionTimeoutMs: 10_000 });

    vi.advanceTimersByTime(9_000);
    socket.receive({ type: 'ka' });
    vi.advanceTimersByTime(9_000);
    expect(onClosed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_001);
    expect(socket.closed).toBe(true);
    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('does not report a close that the caller asked for', () => {
    const { channel, socket, onClosed } = open();

    channel.close();

    expect(socket.closed).toBe(true);
    expect(onClosed).not.toHaveBeenCalled();
  });
});
